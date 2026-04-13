// "use server";
import axios from "axios";
import { configDataType, REQUEST_CONFIG } from "@/services/config";
import {
  ConvertJsonToObject,
  ConvertObjectToJson,
  ConvertObjectToFormData,
} from "./payload-conversion";

export const AxiosPost = async <T>(
  url: string,
  config: configDataType,
  data?: object
): Promise<T> => {
  console.log(`📝 POST_URL : ${url}`);
  console.log("Payload:", data);
  try {
    let bodyData: string | FormData | undefined;
    if (data) {
      bodyData =
        config.contentType === "multipart/form-data"
          ? ConvertObjectToFormData(data)
          : ConvertObjectToJson(data);
    }
    const response = await axios.post<T>(url, bodyData, REQUEST_CONFIG(config));
    // console.log(response.data);
    return response.data as T;
  } catch (error) {
    throw error as T;
  }
};

export const AxiosGet = async <T>(
  url: string,
  config: configDataType
): Promise<T> => {
  console.log(`📗 GET : ${url}`);
  try {
    const response = await axios.get(url, REQUEST_CONFIG(config));
    // console.log(response.data);
    return response.data as T;
  } catch (error) {
    throw error as T;
  }
};

export const AxiosPut = async <T>(
  url: string,
  config: configDataType,
  data?: object
) => {
  console.log(`✏️ PUT : ${url}`);
  console.log("Payload:", data);
  try {
    let bodyData: string | FormData | undefined;
    if (data)
      bodyData =
        config.contentType === "multipart/form-data"
          ? ConvertObjectToFormData(data)
          : ConvertObjectToJson(data);
    const response = await axios.put(url, bodyData, REQUEST_CONFIG(config));
    // console.log(response.data);
    return response.data as T;
  } catch (error) {
    throw error as T;
  }
};

export const AxiosPatch = async <T>(
  url: string,
  config: configDataType,
  data?: object
): Promise<T> => {
  console.log(`🔄 PATCH : ${url}`);
  console.log("Payload:", data);
  try {
    let bodyData: string | FormData | undefined;
    if (data) {
      bodyData =
        config.contentType === "multipart/form-data"
          ? ConvertObjectToFormData(data)
          : ConvertObjectToJson(data);
    }
    const response = await axios.patch<T>(
      url,
      bodyData,
      REQUEST_CONFIG(config)
    );
    // console.log(response.data);
    return response.data as T;
  } catch (error) {
    console.log(`Error in AxiosPatch: ${error}`);
    throw error as T;
  }
};

export const AxiosDelete = async <T>(
  url: string,
  config: configDataType,
  data?: any
): Promise<T> => {
  console.log(`🗑️ DELETE : ${url} Payload: ${data}`);

  try {
    const response = await axios.delete<T>(url, {
      ...REQUEST_CONFIG(config),
      data,
    });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    throw error as T;
  }
};
