import {
  AxiosGet,
  AxiosPut,
  AxiosPost,
  AxiosDelete,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  GetAllUsers_Api_Response_Type,
  GetAllUsers_Api_Payload_Type,
  UpdateUser_Api_Payload_Type,
  UpdateUser_ApiResponse_Type,
  Get_User_By_Id_ApiResponse_Type,
  Add_Delete_Gmail_Api_Response_Type,
  AddRelation_Api_Response_Type,
} from "./users.type";
import { getUsersByGroupApi } from "@/api/users";

// URLs
const getAllUsersApi = (options: any) => {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options?.limit.toString());
  if (options?.page) params.append("page", options?.page.toString());
  if (options?.startDate) params.append("startDate", options?.startDate);
  if (options?.endDate) params.append("endDate", options?.endDate);
  if (options?.userType)
    params.append("userType", options?.userType.toString());
  if (options?.name) params.append("name", options?.name);
  if (options?.countryCode) params.append("countryCode", options?.countryCode);
  if (options?.email) params.append("email", options?.email);
  if (options?.exportData)
    params.append("exportData", options?.exportData.toString());
  if (options?.status !== undefined && options?.status !== "")
    params.append("status", options.status.toString());
  return `${BASE_URL}/api/user/getAllUsers?${params.toString()}`;
};
const addUserApi = () => `${BASE_URL}/api/user/signUp`;
const deactivateUserApi = () => `${BASE_URL}/api/user/deactivate`;
export const deleteUserApi = (id: string) => `${BASE_URL}/api/user/${id}`;
const updateUserApi = () => `${BASE_URL}/api/user/update`;
const getUserByIdApi = (options: { id: string }) => {
  const params = new URLSearchParams({ id: options?.id?.toString() });
  return `${BASE_URL}/api/user/getUserById?${params}`;
};
const addUserGmailApi = (options: { id: string }) =>
  `${BASE_URL}/api/user/${options.id}/add-gmail`;
const removeUserGmailApi = (options: { id: string }) =>
  `${BASE_URL}/api/user/${options.id}/remove-gmail`;
const addRelationApi = () => `${BASE_URL}/api/guardians/relationships`;

///api functions

// fetch all users by group
export const getAllUsersByGroup = (config: configDataType) =>
  AxiosGet<any>(getUsersByGroupApi(), config);

// fetch all users
export const getAllusers = (
  options: GetAllUsers_Api_Payload_Type,
  config: configDataType,
) => AxiosGet<GetAllUsers_Api_Response_Type>(getAllUsersApi(options), config);

// get user by id
export const getUserById = (options: { id: string }, config: configDataType) =>
  AxiosGet<Get_User_By_Id_ApiResponse_Type>(getUserByIdApi(options), config);

// add user
export const adduser = (payload: any, config: configDataType) =>
  AxiosPost<GetAllUsers_Api_Response_Type>(addUserApi(), config, payload);
export const addRelation = (payload: any, config: configDataType) =>
  AxiosPost<AddRelation_Api_Response_Type>(addRelationApi(), config, payload);

// deactivate user
export const deactivateUser = (
  payload: {
    id: string;
    status: boolean;
    permanent: string;
    message: string;
  },
  config: configDataType,
) =>
  AxiosPut<GetAllUsers_Api_Response_Type>(deactivateUserApi(), config, payload);

// delete user
export const deleteUser = (payload: { id: string }, config: configDataType) =>
  AxiosDelete<any>(deleteUserApi(payload?.id), config, payload);

// update user
export const updateUser = (
  config: configDataType,
  payload: UpdateUser_Api_Payload_Type,
) => AxiosPut<UpdateUser_ApiResponse_Type>(updateUserApi(), config, payload);

//add user g-mail
export const addUserGmail = (
  options: { id: string },
  config: configDataType,
  payload: {
    name: string;
    email: string;
  },
) =>
  AxiosPost<Add_Delete_Gmail_Api_Response_Type>(
    addUserGmailApi(options),
    config,
    payload,
  );

// delete user g-mail
export const removeUserGmail = (
  option: { id: string },
  config: configDataType,
  payload: {
    name: string;
    email: string;
  },
) =>
  AxiosDelete<Add_Delete_Gmail_Api_Response_Type>(
    removeUserGmailApi(option),
    config,
    payload,
  );
