import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import {
  createDemoApi,
  getAllDemosApi,
  deleteDemoByApi,
  updateDemoApi,
} from "@/api/demo";
import {
  Create_Demo_Payload_Type,
  Create_Demo_Api_Response_Type,
} from "@/types/demo/createDemo.types";

import {
  GetAllDemos_Api_Params_Type,
  GetAllDemos_Api_Response_Type,
} from "@/types/demo/getAllDemos.types";

///api function
export const getAllDemos = (
  options: GetAllDemos_Api_Params_Type,
  config: configDataType
) => AxiosGet<GetAllDemos_Api_Response_Type>(getAllDemosApi(options), config);

export const createNewDemo = (
  data: Create_Demo_Payload_Type,
  config: configDataType
) => AxiosPost<Create_Demo_Api_Response_Type>(createDemoApi(), config, data);

export const deleteDemo = (id: string, config: configDataType) =>
  AxiosDelete<Create_Demo_Api_Response_Type>(deleteDemoByApi(id), config);

export const updateDemo = (
  id: string,
  data: Create_Demo_Payload_Type,
  config: configDataType
) => AxiosPut<Create_Demo_Api_Response_Type>(updateDemoApi(id), config, data);
