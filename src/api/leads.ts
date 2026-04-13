import { BASE_URL } from "@/services/config";
import { GetAllNewUserInvoices_Api_Params_Type } from "@/types/leads/leads.type";

export const getAllNewUserInvoicesApi = (
  options: GetAllNewUserInvoices_Api_Params_Type
) => {
  const params = new URLSearchParams();
  if (options?.limit !== null) params.append("limit", options.limit.toString());
  if (options?.page !== null) params.append("page", options.page.toString());
  if (options?.search !== "") params.append("search", options.search);
  if (options?.student_gender !== "")
    params.append("student_gender", options.student_gender);
  if (options?.parent_gender !== "")
    params.append("parent_gender", options.parent_gender);
  if (options?.board_id !== null)
    params.append("board_id", options.board_id.toString());
  if (options?.curriculum_id !== null)
    params.append("curriculum_id", options.curriculum_id.toString());
  if (options?.subject_id !== null)
    params.append("subject_id", options.subject_id.toString());
  return `${BASE_URL}/api/leads?${params.toString()}`;
};

export const generateNewUserInvoiceApi = () => {
  return `${BASE_URL}/api/leads`;
};
