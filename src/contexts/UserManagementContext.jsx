import { createContext, useContext } from "react";

export const UserManagementContext = createContext("/admin");

export function useUserManagementBasePath() {
  return useContext(UserManagementContext);
}
