import { BASE_URL } from "@/services/config";

export const getAllRolesApi = () => `${BASE_URL}/api/role`;
export const createRoleApi = () => `${BASE_URL}/api/role`;
export const updateRoleApi = (updateId: string) => {
  const params = new URLSearchParams();
  if (updateId) {
    params.append("id", updateId);
  }
  return `${BASE_URL}/api/role?${params.toString()}`;
};
export const deleteRoleApi = (deleteId: string) => {
  const params = new URLSearchParams();
  if (deleteId) params.append("id", deleteId);
  return `${BASE_URL}/api/role/?${params.toString()}`;
};
export const assignPagesToRoleApi = (roleId: number | null) => {
  return `${BASE_URL}/api/roles/${roleId}/assign-pages`;
};

export const getAllPagesAssignedToRoleApi = (roleId: number | null) => {
  return `${BASE_URL}/api/roles/${roleId}/pages`;
};
