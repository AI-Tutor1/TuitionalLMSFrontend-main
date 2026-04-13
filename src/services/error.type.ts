import { AxiosError } from "axios";

export type MyAxiosError = AxiosError & {
  response?: {
    data: {
      error: string;
      message: string;
    };
  };
  error?: string;
  message?: string;
};
