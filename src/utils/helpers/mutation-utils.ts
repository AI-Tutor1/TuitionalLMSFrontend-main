import { toast } from "react-toastify";

interface AxiosErrorShape {
  message?: string;
  response?: {
    status: number;
    statusText: string;
    data: {
      message?: string;
      error?: string;
    };
  };
}

/**
 * Standard error handler for TanStack Query mutations.
 * Extracts the most useful error message and shows a toast.
 */
export const handleMutationError = (
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred",
): void => {
  const axiosError = error as AxiosErrorShape;

  const message =
    axiosError?.response?.data?.message ||
    axiosError?.response?.data?.error ||
    (axiosError?.response
      ? `${axiosError.response.status} ${axiosError.response.statusText}`
      : axiosError?.message || fallbackMessage);

  toast.error(message);
};

/**
 * Standard success handler pattern for mutations.
 * Shows success toast + invalidates queries + closes modal.
 */
export const createMutationHandlers = (options: {
  successMessage: string;
  queryClient: { invalidateQueries: (opts: { queryKey: string[] }) => void };
  invalidateKeys?: string[][];
  onSuccess?: () => void;
  onError?: () => void;
}) => ({
  onSuccess: (data: { message?: string; error?: string }) => {
    if (data?.error) {
      toast.error(data.error);
      return;
    }
    if (data?.message) {
      toast.success(data.message);
    } else {
      toast.success(options.successMessage);
    }
    options.invalidateKeys?.forEach((key) => {
      options.queryClient.invalidateQueries({ queryKey: key });
    });
    options.onSuccess?.();
  },
  onError: (error: unknown) => {
    handleMutationError(error);
    options.onError?.();
  },
});
