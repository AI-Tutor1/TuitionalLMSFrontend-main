import { BASE_URL } from "@/services/config";

export const getUsersByGroupApi = () =>
  `${BASE_URL}/api/user/getAllUsersGroupBy`;
