"use client";
import React, { CSSProperties, FC, useCallback, useState } from "react";
import classes from "./profile.module.css";
import Image from "next/image";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Flag from "react-world-flags";
import { Country } from "country-state-city";
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { MyAxiosError } from "@/services/error.type";
import DemmyPic from "../../../public/assets/images/demmyPic.png";
import { getUserById } from "@/services/dashboard/superAdmin/uers/users";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import {
  addUserGmail,
  removeUserGmail,
} from "@/services/dashboard/superAdmin/uers/users";
import CalendarIntegration from "@/components/calendar-integration/calendar-integration";
import defaultClasses from "@/styles/table-styles.module.css";

const tabsArr = [
  "My Profile",
  "Change Password",
  "Queries",
  "Terms & Conditions",
  "User Feedback",
];

const StudentProfile: FC = () => {
  const { user, token } = useAppSelector((state) => state.user);
  const COUNTRIES = Country.getAllCountries();

  // states
  const [activeTab, setActiveTab] = useState(tabsArr[0]);

  // functions
  const getCountryCode = (countryName: string) => {
    const country = COUNTRIES.find((c) => c.name === countryName);
    return country?.isoCode || "";
  };

  const handleSuccess = (credentialsResponse: any) => {
    const decode: any = jwtDecode(credentialsResponse?.credential);
    if (decode?.email && decode?.name) {
      handleAddUserGmail?.mutate({
        email: decode?.email.toLowerCase(),
        name: decode?.name,
      });
    } else {
      toast.error("Email not matched");
    }
  };

  //tab function
  const changeTab = useCallback((tab: string) => setActiveTab(tab), []);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["getUserById", user?.id],
    queryFn: () => {
      if (!user?.id || !token) {
        throw new Error("User ID or token missing");
      }
      return getUserById({ id: String(user.id) }, { token });
    },
    enabled: !!token && !!user?.id,
  });

  // paired accounts
  const pairedAccounts = React.useMemo(() => {
    if (!data?.pseudo_names || !data?.connectedEmails) return [];

    const names = data.pseudo_names.split(",");
    const emails = data.connectedEmails.split(",");

    return names.map((name, index) => ({
      name: name.trim(),
      email: emails[index]?.trim() || "",
    }));
  }, [data?.pseudo_names, data?.connectedEmails]);

  const handleAddUserGmail = useMutation({
    mutationFn: (payload: { name: string; email: string }) =>
      addUserGmail({ id: String(user?.id) }, { token }, payload),
    onSuccess: (data: any) => {
      refetch();
      if (data.message) {
        return toast.success(data?.message);
      } else {
        toast.success("Email added successfully.");
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message ||
            axiosError?.response?.data?.error ||
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError?.message);
      }
    },
  });

  const handleRemoveUserGmail = useMutation({
    mutationFn: (payload: { name: string; email: string }) =>
      removeUserGmail({ id: String(user?.id) }, { token }, payload),
    onSuccess: (data: any) => {
      refetch();
      if (data.message) {
        return toast.success(data?.message);
      } else {
        toast.success("Email and name removed successfully");
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message ||
            axiosError?.response?.data?.error ||
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError?.message);
      }
    },
  });

  // Handle error in useEffect instead of component render
  React.useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      toast.error(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "An error occurred",
      );
    }
  }, [error]);

  return (
    <>
      <style>{`
      .nsm7Bb-HzV7m-LgbsSe{
         border: 1px solid var(--color-dashboard-border);
         background-color: var(--main-white-color);
      }
        .nsm7Bb-HzV7m-LgbsSe .nsm7Bb-HzV7m-LgbsSe-BPrWId {
          font-family: var(--leagueSpartan-semiBold-600) !important;
          font-size: var(--regular18-) !important;
          color: var(--black-color);   
        }
      `}</style>
      <main className={classes.container}>
        {isLoading ? (
          <LoadingBox />
        ) : (
          <>
            <div className={classes.section1}>
              <p className={classes.heading}>Account</p>
              <div className={classes.personalInfoBox2}>
                <div className={classes.imageBoxContainer}>
                  <span className={classes.imageBox}>
                    <Image
                      src={data?.profileImageUrl || DemmyPic}
                      alt="Student profile"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  </span>
                  <div
                    className={classes.fields}
                    style={{ minWidth: "max-content" }}
                  >
                    <p>Name</p>
                    <p>{data?.name || "No Show"}</p>
                  </div>
                </div>
                <div className={classes.fields}>
                  <p>Role</p>
                  <p style={{ color: "var(--main-color)" }}>
                    {data?.roleId === 3 ? "Student" : "Teacher"}
                  </p>
                </div>
                <div className={classes.fields}>
                  <p>Phone Number</p>
                  <p>{data?.phone_number || "No Show"}</p>
                </div>
                <div className={classes.fields}>
                  <p>Email</p>
                  <p>{data?.email || "No Show"}</p>
                </div>

                <div className={classes.fields}>
                  <p>Country</p>
                  <div className={classes.flagContainer}>
                    {data?.country ? (
                      <>
                        <div className={classes.flag}>
                          <Flag code={getCountryCode(data?.country)} />
                        </div>
                        <p>{data?.country}</p>
                      </>
                    ) : (
                      "No Show"
                    )}
                  </div>
                </div>
                <div className={classes.fields}>
                  <p>Gender</p>
                  <p>{data?.gender || "No Show"}</p>
                </div>
              </div>
            </div>
            <div className={classes.section2}>
              <p className={classes.heading}>Connected Accounts</p>
              <div className={classes.profileAccountInfoBox}>
                <div className={classes.emailNamesBox}>
                  {!data?.connectedEmails && !data?.pseudo_names ? (
                    <ErrorBox />
                  ) : (
                    pairedAccounts?.map((account, index) => (
                      <div key={index} className={classes.accountsRow}>
                        <p className={classes.connectedEmails}>
                          {account.name}
                        </p>
                        <p className={classes.connectedEmails}>
                          {account.email}
                        </p>
                        <span
                          className={defaultClasses.iconBox}
                          onClick={() =>
                            handleRemoveUserGmail?.mutate({
                              name: account?.name,
                              email: account?.email,
                            })
                          }
                        >
                          <Image
                            src="/assets/svgs/delete.svg"
                            alt="delete"
                            width={16}
                            height={16}
                            style={{
                              width: "var(--normal-text-size)",
                              height: "var(--normal-text-size)",
                            }}
                          />
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className={classes.googleLoginWrapper}>
                  <GoogleOAuthProvider clientId="630202965970-dvri4k6gis79jjjf8vd145usnqabrttg.apps.googleusercontent.com">
                    <GoogleLogin
                      onSuccess={handleSuccess}
                      onError={() => {
                        toast.error("Login Failed");
                      }}
                      shape="rectangular"
                      size="large"
                      theme="outline"
                    />
                  </GoogleOAuthProvider>
                </div>
              </div>
            </div>
            {/* Google Calendar Integration - Only for Teachers */}
            {data?.roleId === 5 && (
              <div className={classes.section3}>
                <CalendarIntegration
                  userId={user?.id || 0}
                  onStatusChange={(enabled) => {
                    console.log(
                      "Calendar integration status changed:",
                      enabled,
                    );
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default StudentProfile;
