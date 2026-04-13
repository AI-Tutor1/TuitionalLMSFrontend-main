import axios from "axios";
import { store } from "@/lib/store/store";
import { emptyUserData } from "@/lib/store/slices/user-slice";
import { emptyAssignedPages } from "@/lib/store/slices/assignedPages-slice";
import { emptyResources } from "@/lib/store/slices/resources-slice";
import { toast } from "react-toastify";

let isRedirecting = false;

export const setupAxiosInterceptors = (): void => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && !isRedirecting) {
        isRedirecting = true;

        store.dispatch(emptyUserData());
        store.dispatch(emptyAssignedPages());
        store.dispatch(emptyResources());

        toast.error("Session expired. Please sign in again.");

        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }

        setTimeout(() => {
          isRedirecting = false;
        }, 3000);
      }

      return Promise.reject(error);
    },
  );
};
