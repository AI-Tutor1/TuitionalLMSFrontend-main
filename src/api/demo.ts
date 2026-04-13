import { BASE_URL } from "@/services/config";
import { GetAllDemos_Api_Params_Type } from "@/types/demo/getAllDemos.types";

export const getAllDemosApi = (options: GetAllDemos_Api_Params_Type) => {
  const searchParams = new URLSearchParams();

  if (options.date) {
    searchParams.append("date", options.date);
  }
  if (options.status) {
    searchParams.append("status", options.status);
  }
  if (options.conversion) {
    searchParams.append("conversion", options.conversion);
  }
  if (options.limit) {
    searchParams.append("limit", options.limit.toString());
  }
  if (options.page) {
    searchParams.append("page", options.page.toString());
  }
  if (options.tutorId) {
    searchParams.append("tutorId", options.tutorId);
  }

  return `${BASE_URL}/api/demos?${searchParams.toString()}`;
};
export const createDemoApi = () => `${BASE_URL}/api/demos`;
export const deleteDemoByApi = (id: string) => `${BASE_URL}/api/demos/${id}`;
export const updateDemoApi = (id: string) => `${BASE_URL}/api/demos/${id}`;
