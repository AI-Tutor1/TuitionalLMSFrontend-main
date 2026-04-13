import { BASE_URL } from "@/services/config";

export const getPagesApi = () => `${BASE_URL}/api/pages`;
export const createPageApi = () => `${BASE_URL}/api/pages`;
export const updatePageApi = (id: string) => `${BASE_URL}/api/pages/${id}`;
export const deletePageApi = (id: string) => `${BASE_URL}/api/pages/${id}`;
