import {
  AxiosGet,
  AxiosPut,
  AxiosPost,
  AxiosDelete,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  getAllVersionsApi,
  createNewVersionApi,
  deleteVersionByIdApi,
  updateVersionByIdApi,
  getVersionByIdApi,
  getCurrentVersionsApi,
} from "@/api/versions";


