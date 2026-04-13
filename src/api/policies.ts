import { BASE_URL } from "@/services/config";
import { GetAllPolicies_Api_Filters } from "@/types/policies/getAllPolicies.type";

export const createNewPolicyApi = () => `${BASE_URL}/api/policy`;
export const getAllPoliciesApi = (options: GetAllPolicies_Api_Filters) => {
  const queryParams = new URLSearchParams();

  if (
    options.title != null &&
    options.title !== undefined &&
    options.title !== ""
  ) {
    queryParams.append("title", options.title);
  }

  if (
    options.assignedTo != null &&
    options.assignedTo !== undefined &&
    options.assignedTo !== ""
  ) {
    queryParams.append("assigned_to", options.assignedTo);
  }

  if (
    options.category != null &&
    options.category !== undefined &&
    options.category !== ""
  ) {
    queryParams.append("category", options.category);
  }

  // Convert to query string
  const queryString = queryParams.toString();

  // Return URL with query string only if there are parameters
  return queryString
    ? `${BASE_URL}/api/policies?${queryString}`
    : `${BASE_URL}/api/policies`;
};
export const updatePolicyApi = (updateId: number) =>
  `${BASE_URL}/api/policy/${updateId}`;
export const deletePolicyApi = (deleteId: number) =>
  `${BASE_URL}/api/policy/${deleteId}`;
