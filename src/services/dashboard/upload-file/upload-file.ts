import { AxiosPost } from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import { FileUpload_Api_Response } from "./upload-file.types";

//urls
const uploadFileApi = () => `${BASE_URL}/api/utils/upload-file`;

///api function
export const getImageString = (config: configDataType, payload: any) =>
  AxiosPost<FileUpload_Api_Response>(uploadFileApi(), config, payload);
