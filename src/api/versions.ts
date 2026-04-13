import { BASE_URL } from "@/services/config";

export const createNewVersionApi = () => `${BASE_URL}/api/version`;
export const getAllVersionsApi = () => `${BASE_URL}/api/version`;
export const getCurrentVersionsApi = () => `${BASE_URL}/api/version/current`;
export const getVersionByIdApi = (id: string) =>
  `${BASE_URL}/api/version/${id}`;
export const updateVersionByIdApi = (id: string) =>
  `${BASE_URL}/api/version/${id}`;
export const deleteVersionByIdApi = (id: string) =>
  `${BASE_URL}/api/version/${id}`;
