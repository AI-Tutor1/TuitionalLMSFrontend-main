import React, { memo, useEffect, useState } from "react";
import styles from "./google-auth.module.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/services/dashboard/superAdmin/users/users";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useAppDispatch } from "@/lib/store/hooks/hooks";
import { setUserSyncing } from "@/lib/store/slices/user-slice";
import { User_Type } from "@/services/auth/auth.types";
import { UpdateUser_Api_Payload_Type } from "@/services/dashboard/superAdmin/users/users.type";

interface GoogleAuthModalProps {
  token?: string;
  user?: User_Type | null;
}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ token, user }) => {
  const dispatch = useAppDispatch();

  const handleSucess = (credentialsResponse: any) => {
    const decode: any = jwtDecode(credentialsResponse.credential);
    if (
      user &&
      "email" in user &&
      decode?.email?.toLowerCase() === user?.email?.toLowerCase()
    ) {
      handleUpdate?.mutate({
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
    <div className={styles.container}>
      <div className={styles.googleContainer}>
        <GoogleOAuthProvider clientId="630202965970-dvri4k6gis79jjjf8vd145usnqabrttg.apps.googleusercontent.com">
          <GoogleLogin
            onSuccess={handleSucess}
            onError={() => {
              toast.error("Login Failed");
              console.log("Login Failed");
            }}
            shape="rectangular"
            size={"large"}
            theme="outline"
          />
        </GoogleOAuthProvider>
        <p className={styles.text}>
          You need to sync with the following email in order to use the
          dashboard.
        </p>
        <span className={styles.email}> {user?.email || ""}</span>
      </div>
    </div>
  );
};

export default memo(GoogleAuthModal);
