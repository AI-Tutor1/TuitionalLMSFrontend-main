"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { withAuth } from "@/utils/withAuth/withAuth";
// Components
import InputField from "@/components/global/input-field/input-field";
import Button from "@/components/global/button/button";
// Icons
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// Styles
import classes from "./page.module.css";
// Services and utilities
import { ForgotPassword } from "@/services/auth/auth";
import { emailRegex } from "@/utils/helpers/regex";
import {
  ForgotPassword_Payload_Type,
  ForgotPassword_Response_Type,
} from "@/services/auth/auth.types";
import { MyAxiosError } from "@/services/error.type";

const Page = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Memoize button styles to prevent re-creating on each render
  const buttonStyles = useMemo(
    () => ({
      width: "100%",
    }),
    [],
  );

  // Memoize input field styles
  const inputStyles = useMemo(
    () => ({
      backgroundColor: "#EEEEEE",
    }),
    [],
  );

  // Handle email input change
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [],
  );

  // Password reset request mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: ForgotPassword_Payload_Type) =>
      ForgotPassword(payload, {}),
    onSuccess: (data: ForgotPassword_Response_Type) => {
      toast.success(data.message);
      router.push(`/password-reset/${encodeURIComponent(email)}`);
      setEmail("");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message || "An unexpected error occurred");
      }
    },
  });

  // Form submission handler
  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      // Validate email before submission
      if (!email.trim()) {
        toast.error("Email is required");
        return;
      }

      if (!emailRegex.test(email)) {
        toast.error("Invalid email format");
        return;
      }

      mutate({ email });
    },
    [email, mutate],
  );

  return (
    <form onSubmit={handleSubmit} className={classes.main}>
      <InputField
        icon1={<MailOutlineIcon />}
        placeholder="Email"
        changeFunc={handleEmailChange}
        value={email}
        inputBoxStyles={inputStyles}
        aria-label="Email address"
      />

      <Button
        text="Send Code"
        type="submit"
        loading={isPending}
        disabled={isPending || !email.trim()}
        inlineStyling={buttonStyles}
      />

      <Link href="/signin" className={classes.textLink}>
        <span>
          <ArrowBackIcon />
        </span>
        Back to sign in
      </Link>
    </form>
  );
};

export default withAuth(Page);
