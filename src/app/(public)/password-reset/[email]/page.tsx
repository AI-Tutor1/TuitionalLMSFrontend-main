"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import VerificationInput from "react-verification-input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { withAuth } from "@/utils/withAuth/withAuth";

// Components
import Button from "@/components/global/button/button";

// Styles
import classes from "./page.module.css";

// Services and types
import { ResetPassword } from "@/services/auth/auth";
import {
  ResetPasword_Type_Payload,
  ResetPasword_Type_Response,
} from "@/services/auth/auth.types";
import { MyAxiosError } from "@/services/error.type";
import { tokenRegex } from "@/utils/helpers/regex";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PasswordResetForm = () => {
  const { email } = useParams<{ email: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string>("");

  // Memoize the decoded email from URL parameter
  const decodedEmail = useMemo(
    () => (email ? decodeURIComponent(email) : ""),
    [email]
  );

  // Memoize button styles to prevent recreating on each render
  const buttonStyles = useMemo(
    () => ({
      width: "100%",
      height: "calc(2.5vh + 15px)",
      maxHeight: "50px",
      minHeight: "30px",
    }),
    []
  );

  // Token change handler with useCallback to maintain referential equality
  const handleTokenChange = useCallback((value: string) => {
    setToken(value);
  }, []);

  // Reset password mutation
  const mutation = useMutation({
    mutationFn: (payload: ResetPasword_Type_Payload) =>
      ResetPassword(payload, {}),
    onSuccess: (data: ResetPasword_Type_Response) => {
      toast.success(data.message);
      router.push(
        `/confirm-password/${encodeURIComponent(decodedEmail)}?token=${token}`
      );
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else {
        toast.error(
          axiosError.message || "An error occurred during password reset"
        );
      }
    },
  });

  // Form submission handler
  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      if (!decodedEmail) {
        toast.error(
          "Email is missing. Please go back to the forgot password page."
        );
        return;
      }

      if (!tokenRegex.test(token)) {
        toast.error("Token should be a 6-digit number");
        return;
      }

      mutation.mutate({ email: decodedEmail, token });
    },
    [decodedEmail, token, mutation]
  );

  return (
    <form onSubmit={handleSubmit} className={classes.main}>
      <VerificationInput
        value={token}
        onChange={handleTokenChange}
        placeholder=""
        classNames={{
          container: classes.container,
          character: classes.character,
          characterInactive: classes.characterInactive,
          characterSelected: classes.characterSelected,
          characterFilled: classes.characterFilled,
        }}
        autoFocus
      />
      <Button
        text="Continue"
        type="submit"
        loading={mutation.isPending}
        disabled={mutation.isPending}
        inlineStyling={buttonStyles}
      />

      <Link href="/signin" className={classes.textLink}>
        <span>
          <ArrowBackIcon />
        </span>
        <p>Back to sign in</p>
      </Link>
    </form>
  );
};

export default withAuth(PasswordResetForm);
