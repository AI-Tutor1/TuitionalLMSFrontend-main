export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.tuitionaledu.com";
export type configDataType = {
  token?: string;
  contentType?: "application/json" | "multipart/form-data";
};

export const REQUEST_CONFIG = (configData: configDataType) => ({
  headers: {
    Authorization: configData.token ? configData.token : "",
    "Content-Type": configData.contentType || "application/json",
  },
});
