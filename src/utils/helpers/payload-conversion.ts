export const ConvertObjectToJson = (data: object) => JSON.stringify(data);
export const ConvertJsonToObject = <T>(data: string) => JSON.parse(data) as T;
export const ConvertObjectToFormData = (data: object) => {
  const formData = new FormData();
  Object.entries(data).map((value) => formData.append(value[0], value[1]));
  return formData;
};
