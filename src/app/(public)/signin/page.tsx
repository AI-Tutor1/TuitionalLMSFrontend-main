"use client";
import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import classes from "./page.module.css";
import { useForm, SubmitHandler } from "react-hook-form";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { emailRegex } from "@/utils/helpers/regex";
import { useAppDispatch } from "@/lib/store/hooks/hooks";
import { SignIn } from "@/services/auth/auth";
import {
  SignIn_Payload_Type,
  SignIn_Response_Type,
} from "@/services/auth/auth.types";
import { MyAxiosError } from "@/services/error.type";
import { setUserData } from "@/lib/store/slices/user-slice";
import InputField from "@/components/global/input-field/input-field";
import Button from "@/components/global/button/button";
import { fetchAllPagesAssignToUser } from "@/lib/store/slices/assignedPages-slice";
import { fetchResources } from "@/lib/store/slices/resources-slice";
import { fetchRoles } from "@/lib/store/slices/role-slice";
import { fetchUsersByGroup } from "@/lib/store/slices/usersByGroup-slice";
import { withAuth } from "@/utils/withAuth/withAuth";
// import useFCM from "@/lib/firebase/hooks/useFCM";

type FormInputs = {
  email: string;
  password: string;
};

const INPUT_BOX_STYLES = {
  background: "#EEEEEE",
  color: "var(--pure-black-color)",
} as const;

const BUTTON_STYLES = {
  width: "100%",
} as const;

const refactorName = (name: string) => {
  if (!name) return undefined;
  const words = name.split(" ");
  if (words.length === 1) {
    return name.toLowerCase();
  }
  return words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("");
};

const SignInForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { register, handleSubmit, reset, resetField } = useForm<FormInputs>({
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [hidePassword, setHidePassword] = useState(true);

  const togglePasswordVisibility = useCallback(() => {
    setHidePassword((prev) => !prev);
  }, []);

  // Authentication mutation
  const mutation = useMutation({
    mutationFn: (payload: SignIn_Payload_Type) => SignIn(payload, {}),
    onSuccess: async (data: SignIn_Response_Type) => {
      try {
        const userData = await Promise.all([
          dispatch(
            fetchAllPagesAssignToUser(data?.user?.roleId, {
              token: data?.token,
            }),
          ),
          dispatch(fetchUsersByGroup({ token: data?.token })),
          dispatch(fetchResources({ token: data?.token })),
          dispatch(fetchRoles({ token: data?.token })),
        ]);
        if (userData) {
          const updatedUser = {
            token: data?.token,
            enrollementIds: data?.enrollementIds
              ? [...data?.enrollementIds]
              : [],
            childrens: data?.childrens ? [...data?.childrens] : [],
            user: { ...data?.user, firebase_token: "" },
          };
          dispatch(setUserData(updatedUser));
          if (data?.user?.roleId) {
            const roleName = refactorName(data?.user?.role?.name);
            router.push(`/${roleName}/dashboard`);
            toast.success("Logged in successfully.");
            reset();
            return;
          }
        }
      } catch (error) {
        toast.error("Failed to initialize user data");
        resetField("password");
        return;
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message || "An error occurred during sign in");
      }
      resetField("password");
      return;
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = useCallback(
    (data) => {
      mutation.mutate({
        email: data.email.trim(),
        password: data.password.trim(),
      });
    },
    [mutation],
  );

  const onError = useCallback((errors: any) => {
    const error = errors.email || errors.password;
    if (error) {
      toast.error(error.message);
    } else {
      return;
    }
  }, []);

  const emailFieldProps = useMemo(
    () =>
      register("email", {
        required: "Email is required",
        setValueAs: (value) => value.trim(),
        pattern: {
          value: emailRegex,
          message: "Invalid email format",
        },
      }),
    [register],
  );

  const passwordFieldProps = useMemo(
    () =>
      register("password", {
        required: "Password is required",
        minLength: {
          value: 6,
          message: "Password must be at least 6 characters",
        },
      }),
    [register],
  );

  const buttonProps = useMemo(
    () => ({
      text: "Sign in",
      type: "submit" as const,
      loading: mutation.isPending,
      disabled: mutation.isPending,
      inlineStyling: BUTTON_STYLES,
    }),
    [mutation.isPending],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className={classes.main}>
      <InputField
        {...emailFieldProps}
        icon1={<MailOutlineIcon />}
        placeholder="Email"
        inputBoxStyles={{ background: INPUT_BOX_STYLES?.background }}
        inputStyles={{ color: "var(--pure-black-color)" }}
      />
      <div className={classes.linkBox}>
        <InputField
          {...passwordFieldProps}
          icon1={<LockOpenIcon />}
          icon2={
            hidePassword ? <VisibilityOffOutlinedIcon /> : <VisibilityIcon />
          }
          placeholder="Password"
          handlePasswordDisability={togglePasswordVisibility}
          hide={hidePassword}
          inputBoxStyles={{ background: INPUT_BOX_STYLES?.background }}
          inputStyles={{ color: INPUT_BOX_STYLES?.color }}
        />
        <Link href="/forgot-password" className={classes.linkStyle}>
          Forgot Password
        </Link>
      </div>
      <Button {...buttonProps} />
    </form>
  );
};

export default withAuth(SignInForm);
