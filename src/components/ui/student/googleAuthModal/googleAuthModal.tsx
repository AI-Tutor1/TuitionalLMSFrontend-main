import React, { memo, useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import styles from "./googleAuthModal.module.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/services/dashboard/superAdmin/users/users";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useAppDispatch } from "@/lib/store/hooks/hooks";
import { setUserSyncing } from "@/lib/store/slices/user-slice";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { UpdateUser_Api_Payload_Type } from "@/services/dashboard/superAdmin/users/users.type";

interface GoogleAuthModalProps {
  handleClose: () => void;
  token?: string;
}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  handleClose,
  token,
}) => {
  const user = useAppSelector((state: any) => state?.user?.user);
  const dispatch = useAppDispatch();

  const handleSucess = (credentialsResponse: any) => {
    const decode: any = jwtDecode(credentialsResponse.credential);
    if (
      "email" in user &&
      decode?.email?.toLowerCase() === user?.email?.toLowerCase()
    ) {
      handleUpdate.mutate({
        id: user?.id || 0,
        pseudo_name: decode?.name || "",
        email: (user?.email ? user.email.toLowerCase() : "") || "",
        roleId: user?.roleId || 0,
        name: user?.name || "",
        status: user?.status || true,
        profileImageUrl: user?.profileImageUrl || "",
        city: user?.city || "",
        country: user?.country || "",
        country_code: user?.country_code || "",
        phone_number: user?.phone_number || 0,
        isSync: true,
      } as any);
    } else {
      toast.error("Email not matched");
    }
  };

  const handleUpdate = useMutation({
    mutationFn: (payload: UpdateUser_Api_Payload_Type) =>
      updateUser(
        {
          token,
        },
        payload
      ),
    onSuccess: (data: any) => {
      dispatch(setUserSyncing(data));
      toast.success("Email Synced Successfully.");
      if (data.message || data.error) {
        return toast.error(data.message || data.error);
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      console.log(axiosError);
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? `${axiosError?.response?.data?.message}`
            : axiosError?.response?.data?.error
            ? `${axiosError?.response?.data?.error}`
            : `${axiosError?.response?.status} ${axiosError?.response?.statusText}`
        );
      } else {
        toast.error(axiosError?.message);
      }
    },
  });

  return (
    <Modal open={!user?.isSync} onClose={handleClose}>
      <div className={styles.googleContainer}>
        <GoogleOAuthProvider clientId="630202965970-dvri4k6gis79jjjf8vd145usnqabrttg.apps.googleusercontent.com">
          <GoogleLogin
            onSuccess={handleSucess}
            onError={() => {
              toast.error("Login Failed");
              console.log("Login Failed");
            }}
            shape={"pill"}
            size={"large"}
            type={"icon"}
            theme={"filled_blue"}
          />
        </GoogleOAuthProvider>
        <p className={styles.text}>Sync with Google</p>
      </div>
    </Modal>
  );
};

export default memo(GoogleAuthModal);
