"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { withAuth } from "@/utils/withAuth/withAuth";

// Components
import InputField from "@/components/global/input-field/input-field";
import Button from "@/components/global/button/button";

// Icons
import LockOpenIcon from "@mui/icons-material/LockOpen";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

// Styles
import classes from "./page.module.css";

// Services and utilities
import { ConfirmPassword } from "@/services/auth/auth";
import { passwordRegex } from "@/utils/helpers/regex";
import {
  ConfirmPassword_Type_Payload,
  ConfirmPassword_Type_Response,
} from "@/services/auth/auth.types";
import { MyAxiosError } from "@/services/error.type";

const ConfirmPasswordForm: React.FC = () => {
  const router = useRouter();
  const { email } = useParams<{ email: string }>();
  // Memoize the decoded email from URL parameter
  const decodedEmail = useMemo(
    () => (email ? decodeURIComponent(email) : ""),
    [email]
  );

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  // Memoize button and input styles
  const buttonStyles = useMemo(
    () => ({
      width: "100%",
      height: "calc(2.5vh + 15px)",
      maxHeight: "50px",
      minHeight: "30px",
    }),
    []
  );

  const inputStyles = useMemo(
    () => ({
      backgroundColor: "#EEEEEE",
    }),
    []
  );
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const toggleNewPasswordVisibility = useCallback(() => {
    setHideNewPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setHideConfirmPassword((prev) => !prev);
  }, []);

  // Handle password input changes
  const handlePasswordChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswords((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  // Password confirmation mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: ConfirmPassword_Type_Payload) =>
      ConfirmPassword(payload, {}),
    onSuccess: (data: ConfirmPassword_Type_Response) => {
      toast.success(data.message);
      router.push("/signin");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else {
        toast.error(axiosError.message || "An unexpected error occurred");
      }
    },
  });

  // Validate password strength
  const validatePassword = useCallback((password: string) => {
    if (!password || password.length < 8) {
      return false;
    }

    // Use passwordRegex if available, otherwise use basic validation
    if (passwordRegex && typeof passwordRegex.test === "function") {
      return passwordRegex.test(password);
    }

    // Basic validation as fallback
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const { newPassword, confirmNewPassword } = passwords;

      // Validation checks
      // if (!validatePassword(newPassword)) {
      //   toast.error(
      //     "Password must be at least 8 characters long and include uppercase, lowercase, numeric, and special characters."
      //   );
      //   return;
      // }

      if (newPassword !== confirmNewPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // All validations passed, proceed with mutation
      if (decodedEmail && token) {
        mutate({ email: decodedEmail, newPassword, token });
      }
    },
    [passwords, decodedEmail, token, mutate, validatePassword]
  );

  return (
    <form onSubmit={handleSubmit} className={classes.main}>
      <InputField
        icon1={<LockOpenIcon />}
        icon2={
          hideNewPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityIcon />
        }
        placeholder="New Password"
        changeFunc={handlePasswordChange("newPassword")}
        value={passwords?.newPassword}
        required
        inputBoxStyles={inputStyles}
        handlePasswordDisability={toggleNewPasswordVisibility}
        hide={hideNewPassword}
      />
      <InputField
        icon1={<LockOpenIcon />}
        icon2={
          hideConfirmPassword ? (
            <VisibilityOffOutlinedIcon />
          ) : (
            <VisibilityIcon />
          )
        }
        placeholder="Confirm New Password"
        changeFunc={handlePasswordChange("confirmNewPassword")}
        value={passwords?.confirmNewPassword}
        required
        inputBoxStyles={inputStyles}
        handlePasswordDisability={toggleConfirmPasswordVisibility}
        hide={hideConfirmPassword}
      />
      <Button
        text="Confirm Password"
        type="submit"
        loading={isPending}
        disabled={isPending}
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

export default withAuth(ConfirmPasswordForm);
