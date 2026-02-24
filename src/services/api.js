const BASE_URL = "http://127.0.0.1:8000";

// ── Token helpers ──────────────────────────────────────────────────────────
const getTokens = () => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
});

const setTokens = (access, refresh) => {
  if (access) localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("activeScopeId");
  localStorage.removeItem("active");
};

// ── Scope helper ───────────────────────────────────────────────────────────
export const getActiveScopeId = () => {
  const direct = localStorage.getItem("activeScopeId");
  if (direct) return direct;
  try {
    const raw = localStorage.getItem("active");
    const a = raw ? JSON.parse(raw) : null;
    if (a?.scope_id) return String(a.scope_id);
  } catch {
    /* ignore */
  }
  return null;
};

export const setActiveScopeId = (scopeId, scopeType, label) => {
  localStorage.setItem("activeScopeId", String(scopeId));
  localStorage.setItem(
    "active",
    JSON.stringify({ mode: "SCOPE", scope_type: scopeType, scope_id: scopeId, label })
  );
};

// ── Error extraction (DRF field-level errors) ──────────────────────────────
const extractError = (data, fallback) => {
  if (!data) return fallback || "Request failed";
  if (typeof data === "string") return data;

  if (typeof data === "object" && !data.message && !data.detail && !data.error) {
    const errors = [];
    for (const [field, messages] of Object.entries(data)) {
      const label = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      if (Array.isArray(messages)) messages.forEach((m) => errors.push(`${label}: ${m}`));
      else if (typeof messages === "string") errors.push(`${label}: ${messages}`);
    }
    if (errors.length) return errors.join("\n");
  }

  return data.message || data.detail || data.error || fallback || "Request failed";
};

// ── Core request function ──────────────────────────────────────────────────
const apiRequest = async (endpoint, options = {}) => {
  const { accessToken } = getTokens();
  const scopeId = getActiveScopeId();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(scopeId && { "X-Scope-ID": scopeId }),
      ...options.headers,
    },
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Auto-refresh on 401
  if (response.status === 401 && endpoint !== "/api/v1/auth/token/refresh/") {
    try {
      await authAPI.refreshToken();
      const { accessToken: refreshed } = getTokens();
      config.headers = { ...config.headers, Authorization: `Bearer ${refreshed}` };
      response = await fetch(`${BASE_URL}${endpoint}`, config);
    } catch {
      /* fall through */
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) throw new Error(response.statusText || "Request failed");
    return {};
  }

  if (!response.ok) throw new Error(extractError(data, response.statusText));
  return data;
};

// ── Generic CRUD factory ───────────────────────────────────────────────────
const crud = (base) => ({
  list: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`${base}${qs}`);
  },
  get: (id) => apiRequest(`${base}${id}/`),
  create: (payload) => apiRequest(base, { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    apiRequest(`${base}${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  delete: (id) => apiRequest(`${base}${id}/`, { method: "DELETE" }),
});

// ── Auth API ───────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (username, password) => {
    const data = await apiRequest("/api/v1/auth/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (data.access && data.refresh) setTokens(data.access, data.refresh);
    return data;
  },

  refreshToken: async () => {
    const { refreshToken } = getTokens();
    if (!refreshToken) throw new Error("Missing refresh token");
    const data = await apiRequest("/api/v1/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (data.access) setTokens(data.access, null);
    return data;
  },

  logout: () => clearTokens(),
  isAuthenticated: () => !!getTokens().accessToken,
  getMe: () => apiRequest("/api/v1/accounts/me/"),
  getAvailableScopes: () => apiRequest("/api/v1/accounts/me/available-scopes/"),
};

// ── Accounts API ───────────────────────────────────────────────────────────
export const orgsAPI = crud("/api/v1/accounts/orgs/");
export const companiesAPI = crud("/api/v1/accounts/companies/");
export const entitiesAPI = crud("/api/v1/accounts/entities/");
export const scopesAPI = crud("/api/v1/accounts/scopes/");
export const usersAPI = {
  ...crud("/api/v1/accounts/users/"),
  changePassword: (payload) =>
    apiRequest("/api/v1/accounts/change-password/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  inviteUser: (payload) =>
    apiRequest("/api/v1/accounts/users/invite_user/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  resetPassword: (id) =>
    apiRequest(`/api/v1/accounts/users/${id}/reset_password/`, { method: "POST" }),
  revokeInvitation: (id) =>
    apiRequest(`/api/v1/accounts/users/${id}/revoke_invitation/`, { method: "POST" }),
  setStatus: (id, status) =>
    apiRequest(`/api/v1/accounts/users/${id}/set_status/`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  changeLog: (id) => apiRequest(`/api/v1/accounts/users/${id}/change_log/`),
  bulkAction: (payload) =>
    apiRequest("/api/v1/accounts/users/bulk_action/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
export const rolesAPI = {
  ...crud("/api/v1/accounts/roles/"),
  publish: (id) =>
    apiRequest(`/api/v1/accounts/roles/${id}/publish/`, { method: "POST" }),
  duplicate: (id) =>
    apiRequest(`/api/v1/accounts/roles/${id}/duplicate/`, { method: "POST" }),
};
export const permissionsAPI = crud("/api/v1/accounts/permissions/");
export const membershipsAPI = crud("/api/v1/accounts/memberships/");
export const rolePermissionsAPI = crud("/api/v1/accounts/role-permissions/");
export const userProfilesAPI = crud("/api/v1/accounts/user-profiles/");
export const orgTreeAPI = {
  list: () => apiRequest("/api/v1/accounts/org-tree/"),
  get: (orgId) => apiRequest(`/api/v1/accounts/org-tree/${orgId}/`),
};

// ── Properties API ─────────────────────────────────────────────────────────
export const sitesAPI = {
  ...crud("/api/v1/properties/sites/"),
  fullTree: (id) => apiRequest(`/api/v1/properties/sites/${id}/full-tree/`),
  siteTypes: () => apiRequest("/api/v1/properties/site-types/"),
};
export const towersAPI = crud("/api/v1/properties/towers/");
export const floorsAPI = crud("/api/v1/properties/floors/");
export const unitsAPI = crud("/api/v1/properties/units/");
export const amenitiesAPI = crud("/api/v1/properties/amenities/");
export const siteAmenitiesAPI = crud("/api/v1/properties/site-amenities/");
export const unitAmenitiesAPI = crud("/api/v1/properties/unit-amenities/");
export const assetCategoriesAPI = crud("/api/v1/properties/asset-categories/");
export const assetItemsAPI = crud("/api/v1/properties/asset-items/");
export const unitAssetsAPI = crud("/api/v1/properties/unit-assets/");

// ── Tenants API ────────────────────────────────────────────────────────────
export const tenantCompaniesAPI = crud("/api/v1/tenants/companies/");
export const tenantContactsAPI = crud("/api/v1/tenants/contacts/");
export const tenantKycAPI = {
  ...crud("/api/v1/tenants/kyc/"),
  verify: (id) => apiRequest(`/api/v1/tenants/kyc/${id}/verify/`, { method: "POST" }),
  reject: (id, reason) =>
    apiRequest(`/api/v1/tenants/kyc/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
export const tenantPreferencesAPI = crud("/api/v1/tenants/preferences/");

// ── Billing API ────────────────────────────────────────────────────────────
export const siteBillingConfigAPI = {
  ...crud("/api/v1/billing/site-billing-configs/"),
  bySite: (siteId) => apiRequest(`/api/v1/billing/site-billing-configs/by-site/${siteId}/`),
  resetCounter: (id, value) =>
    apiRequest(`/api/v1/billing/site-billing-configs/${id}/reset-counter/`, {
      method: "POST",
      body: JSON.stringify({ value: value ?? 1 }),
    }),
  previewInvoiceNumber: (id) =>
    apiRequest(`/api/v1/billing/site-billing-configs/${id}/preview-invoice-number/`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};
export const billingRulesAPI = {
  ...crud("/api/v1/billing/billing-rules/"),
  activate: (id) => apiRequest(`/api/v1/billing/billing-rules/${id}/activate/`, { method: "POST" }),
  deactivate: (id) => apiRequest(`/api/v1/billing/billing-rules/${id}/deactivate/`, { method: "POST" }),
  clone: (id) => apiRequest(`/api/v1/billing/billing-rules/${id}/clone/`, { method: "POST" }),
};
export const invoiceSchedulesAPI = {
  ...crud("/api/v1/billing/invoice-schedules/"),
  generate: (id) => apiRequest(`/api/v1/billing/invoice-schedules/${id}/generate/`, { method: "POST" }),
};
export const invoicesAPI = {
  ...crud("/api/v1/billing/invoices/"),
  send: (id) => apiRequest(`/api/v1/billing/invoices/${id}/send/`, { method: "POST" }),
  dispute: (id, reason) =>
    apiRequest(`/api/v1/billing/invoices/${id}/dispute/`, {
      method: "POST",
      body: JSON.stringify({ reason: reason ?? "" }),
    }),
  resolveDispute: (id) =>
    apiRequest(`/api/v1/billing/invoices/${id}/resolve-dispute/`, { method: "POST" }),
  overdue: () => apiRequest("/api/v1/billing/invoices/overdue/"),
  summary: () => apiRequest("/api/v1/billing/invoices/summary/"),
  bulkEmail: (invoiceIds) =>
    apiRequest("/api/v1/billing/invoices/bulk_email/", {
      method: "POST",
      body: JSON.stringify({ invoice_ids: invoiceIds }),
    }),
  export: (params) => {
    const qp = params ? Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = v;
      return acc;
    }, {}) : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return fetch(`${BASE_URL}/api/v1/billing/invoices/export/${qs}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    }).then((r) => r.blob());
  },
};

export const invoiceAttachmentsAPI = {
  list: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/billing/invoice-attachments/${qs}`);
  },
  create: (invoiceId, file) => {
    const form = new FormData();
    form.append("invoice", invoiceId);
    form.append("file", file);
    const scopeId = getActiveScopeId();
    return fetch(`${BASE_URL}/api/v1/billing/invoice-attachments/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        ...(scopeId && { "X-Scope-ID": scopeId }),
      },
      body: form,
    }).then((r) => {
      if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.error || d.detail || "Upload failed")));
      return r.json();
    });
  },
  download: (id) => {
    const scopeId = getActiveScopeId();
    return fetch(`${BASE_URL}/api/v1/billing/invoice-attachments/${id}/download/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        ...(scopeId && { "X-Scope-ID": scopeId }),
      },
    });
  },
};
export const paymentsAPI = {
  ...crud("/api/v1/billing/payments/"),
  reverse: (id) => apiRequest(`/api/v1/billing/payments/${id}/reverse/`, { method: "POST" }),
};
export const creditNotesAPI = {
  ...crud("/api/v1/billing/credit-notes/"),
  approve: (id) => apiRequest(`/api/v1/billing/credit-notes/${id}/approve/`, { method: "POST" }),
  reject: (id, reason) =>
    apiRequest(`/api/v1/billing/credit-notes/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ reason: reason ?? "" }),
    }),
  apply: (id) => apiRequest(`/api/v1/billing/credit-notes/${id}/apply/`, { method: "POST" }),
};
export const arSummariesAPI = {
  ...crud("/api/v1/billing/ar-summaries/"),
  byAgreement: (agreementId) =>
    apiRequest(`/api/v1/billing/ar-summaries/by-agreement/${agreementId}/`),
  refresh: (agreementId) =>
    apiRequest(`/api/v1/billing/ar-summaries/refresh/${agreementId}/`, { method: "POST" }),
  overall: () => apiRequest("/api/v1/billing/ar-summaries/overall/"),
};
export const rentSchedulesAPI = {
  ...crud("/api/v1/billing/rent-schedule-lines/"),
  generate: (payload) =>
    apiRequest("/api/v1/billing/rent-schedule-lines/generate/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  markInvoiced: (payload) =>
    apiRequest("/api/v1/billing/rent-schedule-lines/mark-invoiced/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adjustAmounts: (payload) =>
    apiRequest("/api/v1/billing/rent-schedule-lines/adjust-amounts/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  export: (params) => {
    const qp = params ? Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = v;
      return acc;
    }, {}) : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return fetch(`${BASE_URL}/api/v1/billing/rent-schedule-lines/export/${qs}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        ...(getActiveScopeId() && { "X-Scope-ID": getActiveScopeId() }),
      },
    }).then((r) => r.blob());
  },
  kpis: () => apiRequest("/api/v1/billing/rent-schedule-kpis/"),
};
export const receivablesAPI = {
  list: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/billing/receivables/${qs}`);
  },
};

export const revenueRecognitionAPI = {
  list: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/billing/revenue-recognition/${qs}`);
  },
  export: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    const scopeId = getActiveScopeId();
    return fetch(`${BASE_URL}/api/v1/billing/revenue-recognition/export/${qs}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        ...(scopeId && { "X-Scope-ID": scopeId }),
      },
    }).then((r) => r.blob());
  },
};
export const arRulesAPI = {
  ...crud("/api/v1/billing/ar-rules/"),
  byAgreement: (agreementId) =>
    apiRequest(`/api/v1/billing/ar-rules/by-agreement/${agreementId}/`),
};
export const ageingBucketsAPI = {
  ...crud("/api/v1/billing/ageing-buckets/"),
  initializeDefaults: () =>
    apiRequest("/api/v1/billing/ageing-buckets/initialize-defaults/", { method: "POST" }),
};
export const ageingConfigAPI = crud("/api/v1/billing/ageing-config/");
export const disputeRulesAPI = {
  ...crud("/api/v1/billing/dispute-rules/"),
  activate: (id) => apiRequest(`/api/v1/billing/dispute-rules/${id}/activate/`, { method: "POST" }),
  deactivate: (id) => apiRequest(`/api/v1/billing/dispute-rules/${id}/deactivate/`, { method: "POST" }),
  reorder: (order) =>
    apiRequest("/api/v1/billing/dispute-rules/reorder/", {
      method: "POST",
      body: JSON.stringify({ order }),
    }),
};
export const creditRulesAPI = {
  ...crud("/api/v1/billing/credit-rules/"),
  activate: (id) => apiRequest(`/api/v1/billing/credit-rules/${id}/activate/`, { method: "POST" }),
  deactivate: (id) => apiRequest(`/api/v1/billing/credit-rules/${id}/deactivate/`, { method: "POST" }),
};
export const arGlobalSettingsAPI = {
  list: () => apiRequest("/api/v1/billing/ar-global-settings/"),
  create: (payload) =>
    apiRequest("/api/v1/billing/ar-global-settings/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (payload) =>
    apiRequest("/api/v1/billing/ar-global-settings/update/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
export const pendingActionsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/billing/pending-actions/${qs ? "?" + qs : ""}`);
  },
  count: () => apiRequest("/api/v1/billing/pending-actions/count/"),
  apply: (id, note = "") =>
    apiRequest(`/api/v1/billing/pending-actions/${id}/apply/`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),
  dismiss: (id, note = "") =>
    apiRequest(`/api/v1/billing/pending-actions/${id}/dismiss/`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),
};
export const billingConfigBundleAPI = () => apiRequest("/api/v1/billing/config/");
export const siteBillingConfigBundleAPI = (siteId) =>
  apiRequest(`/api/v1/billing/site/${siteId}/config/`);

// ── Clauses API ────────────────────────────────────────────────────────────
export const clauseCategoriesAPI = {
  ...crud("/api/v1/clauses/categories/"),
  tree: () => apiRequest("/api/v1/clauses/categories/tree/"),
};
export const clausesAPI = {
  ...crud("/api/v1/clauses/clauses/"),
  versions: (id) => apiRequest(`/api/v1/clauses/clauses/${id}/versions/`),
  bump: (id, payload) =>
    apiRequest(`/api/v1/clauses/clauses/${id}/bump/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  duplicate: (id, payload) =>
    apiRequest(`/api/v1/clauses/clauses/${id}/duplicate/`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),
};
export const clauseVersionsAPI = crud("/api/v1/clauses/versions/");
export const clauseDocumentsAPI = {
  ...crud("/api/v1/clauses/documents/"),
  upload: (formData) => {
    const { accessToken } = getTokens();
    const scopeId = getActiveScopeId();
    const headers = {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(scopeId && { "X-Scope-ID": scopeId }),
    };
    return fetch(`${BASE_URL}/api/v1/clauses/documents/`, {
      method: "POST",
      headers,
      body: formData,
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(extractError(data, r.statusText));
      return data;
    });
  },
};
export const clauseDocumentLinksAPI = crud("/api/v1/clauses/document-links/");
export const clauseUsagesAPI = {
  ...crud("/api/v1/clauses/usages/"),
  byAgreement: (agreementId) =>
    apiRequest(`/api/v1/clauses/usages/by-agreement/${agreementId}/`),
  byClause: (clauseId) =>
    apiRequest(`/api/v1/clauses/usages/by-clause/${clauseId}/`),
};
export const clauseStatsAPI = {
  summary: () => apiRequest("/api/v1/clauses/stats/summary/"),
  byCategory: () => apiRequest("/api/v1/clauses/stats/by-category/"),
};

// ── Leases API ─────────────────────────────────────────────────────────────
const apiFormRequest = async (endpoint, method, formData) => {
  const { accessToken } = getTokens();
  const scopeId = getActiveScopeId();
  const headers = {
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(scopeId && { "X-Scope-ID": scopeId }),
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(extractError(data, response.statusText));
  return data;
};

export const agreementsAPI = {
  ...crud("/api/v1/leases/agreements/"),
  terms: (id) => apiRequest(`/api/v1/leases/agreements/${id}/terms/`),
  pricingPreview: (id, payload) =>
    apiRequest(`/api/v1/leases/agreements/${id}/pricing-preview/`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),
  bundle: (id, payload) =>
    apiRequest(`/api/v1/leases/agreements/${id}/bundle/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  submit: (id) => apiRequest(`/api/v1/leases/agreements/${id}/submit/`, { method: "POST" }),
  activate: (id) => apiRequest(`/api/v1/leases/agreements/${id}/activate/`, { method: "POST" }),
  terminate: (id) => apiRequest(`/api/v1/leases/agreements/${id}/terminate/`, { method: "POST" }),
  byTenant: (tenantId) => apiRequest(`/api/v1/leases/agreements/by-tenant/?tenant_id=${tenantId}`),
  generatePdf: (id, sectionId) => {
    const scopeId = getActiveScopeId();
    const qs = sectionId ? `?section=${sectionId}` : "";
    return fetch(`${BASE_URL}/api/v1/leases/agreements/${id}/generate-pdf/${qs}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        ...(scopeId && { "X-Scope-ID": scopeId }),
      },
    }).then(async (r) => {
      if (!r.ok) {
        const text = await r.text();
        // Try to parse as JSON, fallback to text
        try {
          const d = JSON.parse(text);
          return Promise.reject(new Error(d.detail || d.error || "PDF generation failed"));
        } catch {
          return Promise.reject(new Error(`PDF generation failed: ${r.status} ${r.statusText}`));
        }
      }
      return r.blob();
    });
  },
  previewHtml: (id, sectionId) => {
    const scopeId = getActiveScopeId();
    const qs = sectionId ? `?section=${sectionId}` : "";
    return fetch(`${BASE_URL}/api/v1/leases/agreements/${id}/preview-html/${qs}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        ...(scopeId && { "X-Scope-ID": scopeId }),
      },
    }).then(async (r) => {
      if (!r.ok) {
        const text = await r.text();
        try {
          const d = JSON.parse(text);
          return Promise.reject(new Error(d.detail || d.error || "Preview failed"));
        } catch {
          return Promise.reject(new Error(`Preview failed: ${r.status} ${r.statusText}`));
        }
      }
      return r.text();
    });
  },
};

export const allocationsAPI = {
  ...crud("/api/v1/leases/allocations/"),
  byAgreement: (agreementId) => apiRequest(`/api/v1/leases/allocations/?agreement_id=${agreementId}`),
};

export const escalationTemplatesAPI = {
  ...crud("/api/v1/leases/escalation-templates/"),
  activate: (id) => apiRequest(`/api/v1/leases/escalation-templates/${id}/activate/`, { method: "POST" }),
  archive: (id) => apiRequest(`/api/v1/leases/escalation-templates/${id}/archive/`, { method: "POST" }),
  clone: (id) => apiRequest(`/api/v1/leases/escalation-templates/${id}/clone/`, { method: "POST" }),
};

export const agreementStructuresAPI = {
  ...crud("/api/v1/leases/agreement-structures/"),
  tree: () => apiRequest("/api/v1/leases/agreement-structures/tree/"),
};

export const agreementSectionsAPI = {
  ...crud("/api/v1/leases/agreement-sections/"),
  tree: (structureId) =>
    apiRequest(`/api/v1/leases/agreement-sections/tree/?structure=${structureId}`),
};

export const leaseAvailabilityAPI = {
  tree: (siteId) => apiRequest(`/api/v1/leases/availability/tree/?site_id=${siteId}`),
};

export const leaseDocumentsAPI = {
  ...crud("/api/v1/leases/documents/"),
  upload: (formData) => apiFormRequest("/api/v1/leases/documents/", "POST", formData),
};

export const leaseNotesAPI = {
  ...crud("/api/v1/leases/notes/"),
  byAgreement: (agreementId) => apiRequest(`/api/v1/leases/notes/?agreement_id=${agreementId}`),
};

export const leaseAmendmentsAPI = {
  ...crud("/api/v1/leases/amendments/"),
  submit: (id) => apiRequest(`/api/v1/leases/amendments/${id}/submit/`, { method: "POST" }),
  approve: (id) => apiRequest(`/api/v1/leases/amendments/${id}/approve/`, { method: "POST" }),
  reject: (id) => apiRequest(`/api/v1/leases/amendments/${id}/reject/`, { method: "POST" }),
  execute: (id) => apiRequest(`/api/v1/leases/amendments/${id}/execute/`, { method: "POST" }),
  byAgreement: (agreementId) => apiRequest(`/api/v1/leases/amendments/by-agreement/${agreementId}/`),
};

export const amendmentApprovalsAPI = {
  ...crud("/api/v1/leases/amendment-approvals/"),
  action: (id, payload) =>
    apiRequest(`/api/v1/leases/amendment-approvals/${id}/action/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const amendmentAttachmentsAPI = {
  ...crud("/api/v1/leases/amendment-attachments/"),
  upload: (formData) => apiFormRequest("/api/v1/leases/amendment-attachments/", "POST", formData),
};

export const leaseLinkedDocumentsAPI = {
  ...crud("/api/v1/leases/linked-documents/"),
  expiring: () => apiRequest("/api/v1/leases/linked-documents/expiring/"),
  expired: () => apiRequest("/api/v1/leases/linked-documents/expired/"),
  byAgreement: (agreementId) => apiRequest(`/api/v1/leases/linked-documents/by-agreement/${agreementId}/`),
  upload: (formData) => apiFormRequest("/api/v1/leases/linked-documents/", "POST", formData),
};

export const documentApprovalsAPI = {
  ...crud("/api/v1/leases/document-approvals/"),
  action: (id, payload) =>
    apiRequest(`/api/v1/leases/document-approvals/${id}/action/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const leaseClauseConfigAPI = {
  get: (agreementId) => apiRequest(`/api/v1/leases/clause-config/${agreementId}/config/`),
  update: (agreementId, payload) =>
    apiRequest(`/api/v1/leases/clause-config/${agreementId}/config/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

// ── Dashboard API ──────────────────────────────────────────────────────────
export const dashboardAPI = {
  getDashboard: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/${qs}`);
  },
  getKPIs: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/kpis/${qs}`);
  },
  getCharts: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/charts/${qs}`);
  },
  getTables: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/tables/${qs}`);
  },
  getPortfolioMap: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/portfolio_map/${qs}`);
  },
  getOccupancyTimeline: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/occupancy_timeline/${qs}`);
  },
  getAlerts: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/alerts/${qs}`);
  },
  getQuickActions: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/quick_actions/${qs}`);
  },
  getProperties: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/properties/${qs}`);
  },
  getPortfolioStats: (params) => {
    const qp = params
      ? Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null && v !== "") acc[k] = v;
          return acc;
        }, {})
      : {};
    const qs = Object.keys(qp).length ? `?${new URLSearchParams(qp)}` : "";
    return apiRequest(`/api/v1/reports/dashboard/portfolio_stats/${qs}`);
  },
  getFilters: () => apiRequest("/api/v1/reports/dashboard/filters/"),
};

// ── Approvals API ──────────────────────────────────────────────────────────
export const approvalsAPI = {
  ...crud("/api/v1/approvals/rules/"),
  activate: (id) =>
    apiRequest(`/api/v1/approvals/rules/${id}/activate/`, { method: "POST" }),
  deactivate: (id) =>
    apiRequest(`/api/v1/approvals/rules/${id}/deactivate/`, { method: "POST" }),
  simulate: (payload) =>
    apiRequest("/api/v1/approvals/rules/simulate/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  stats: () => apiRequest("/api/v1/approvals/rules/stats/"),
  duplicate: (id) =>
    apiRequest(`/api/v1/approvals/rules/${id}/duplicate/`, { method: "POST" }),
};

export default apiRequest;
