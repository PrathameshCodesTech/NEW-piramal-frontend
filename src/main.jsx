import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ScopeProvider } from "./contexts/ScopeContext";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ScopeProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </ScopeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
