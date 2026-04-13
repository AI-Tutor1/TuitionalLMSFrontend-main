import { BASE_URL } from "@/services/config";

export const addResourceApi = () => `${BASE_URL}/api/resource`;
export const getAllResourcesApi = (options: {
  limit: string;
  page: string;
  search?: string;
}) => {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options?.page);
  if (options?.limit) params.append("limit", options?.limit);
  if (options?.search) params.append("search", options?.search);
  return `${BASE_URL}/api/resource?${params.toString()}`;
};
export const updateResourceApi = (updateId: number | null) =>
  `${BASE_URL}/api/resource/${updateId}`;
export const deleteResourceApi = (deleteId: number | null) =>
  `${BASE_URL}/api/resource/${deleteId}`;
export const addLikeToResourceApi = (id: number) =>
  `${BASE_URL}/api/resource/${id}/like`;
export const downloadResourceApi = (id: number) =>
  `${BASE_URL}/api/resource/${id}/download`;
