/**
 * Build URLSearchParams from an options object, skipping null/undefined/empty values.
 * Eliminates the repeated if-append pattern across all API files.
 */
export const buildQueryParams = (
  options: Record<string, string | number | boolean | null | undefined>,
): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(options).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  return params;
};

/**
 * Build a full URL with query params appended.
 */
export const buildApiUrl = (
  baseUrl: string,
  options: Record<string, string | number | boolean | null | undefined>,
): string => {
  const params = buildQueryParams(options);
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
