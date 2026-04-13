export const ConvertObjectToJson = (data: object) => JSON.stringify(data);
export const ConvertJsonToObject = <T>(data: string) => JSON.parse(data) as T;
export const ConvertObjectToFormData = (
  data: Record<string, unknown>,
  formData: FormData = new FormData(),
  parentKey?: string
): FormData => {
  Object.entries(data).forEach(([key, value]) => {
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === null || value === undefined) {
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(`${formKey}[${index}]`, item);
        } else if (typeof item === "object" && item !== null) {
          ConvertObjectToFormData(
            item as Record<string, unknown>,
            formData,
            `${formKey}[${index}]`
          );
        } else {
          formData.append(`${formKey}[${index}]`, String(item));
        }
      });
    } else if (typeof value === "object" && !(value instanceof Date)) {
      ConvertObjectToFormData(
        value as Record<string, unknown>,
        formData,
        formKey
      );
    } else {
      formData.append(formKey, String(value));
    }
  });

  return formData;
};
