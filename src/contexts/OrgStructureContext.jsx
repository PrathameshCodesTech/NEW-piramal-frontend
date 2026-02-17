import { createContext, useContext } from "react";

export const OrgStructureContext = createContext("/admin");

export function useOrgStructureBasePath() {
  return useContext(OrgStructureContext);
}
