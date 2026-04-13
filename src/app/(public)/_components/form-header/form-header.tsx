"use client";
import React, { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import classes from "./form-header.module.css";
import { toast } from "react-toastify";

// Type definitions for better type safety
interface RouteContent {
  heading: string;
  text: string | React.ReactNode;
}

interface RouteParams {
  email?: string;
  [key: string]: string | undefined;
}

// Static route configuration object
const ROUTE_CONFIG: Readonly<Record<string, RouteContent>> = {
  signin: {
    heading: "Sign in",
    text: "Login to manage your account",
  },
  "forgot-password": {
    heading: "Forgot Password?",
    text: "To reset your password, enter your email address below",
  },
} as const;

const ROUTE_PATTERNS: ReadonlyArray<readonly [string, string]> = [
  ["/signin", "signin"],
  ["/forgot-password", "forgot-password"],
  ["/password-reset", "password-reset"],
  ["/confirm-password", "confirm-password"],
] as const;

// Optimized route type detection
const getRouteType = (pathname: string): string => {
  for (const [pattern, type] of ROUTE_PATTERNS) {
    if (pathname.includes(pattern)) return type;
  }
  return "default";
};

// Separate decode function for reusability and testing
const decodeEmailSafely = (email: string | undefined): string => {
  if (!email) return "";
  try {
    return decodeURIComponent(email);
  } catch (error) {
    toast.error("Error decoding email:");
    return "Wrong Email";
  }
};

// Memoized component to prevent unnecessary re-renders
const FormHeader = React.memo(() => {
  const pathname = usePathname();
  const params = useParams<RouteParams>();

  // Memoize decoded email to avoid re-decoding on every render
  const decodedEmail = useMemo(
    () => decodeEmailSafely(params.email),
    [params.email]
  );

  // Memoize route type to avoid recalculation
  const routeType = useMemo(() => getRouteType(pathname), [pathname]);

  // Memoize content to avoid recreation on every render
  const content = useMemo<RouteContent>(() => {
    if (routeType in ROUTE_CONFIG) {
      return ROUTE_CONFIG[routeType];
    }

    // Handle dynamic content cases
    switch (routeType) {
      case "password-reset":
        return {
          heading: "Password Reset",
          text: decodedEmail ? (
            <>
              We sent a code to{" "}
              <span className={classes.email}>{decodedEmail}</span>. Please
              enter the code below to reset your password.
            </>
          ) : (
            "Please enter the code below to reset your password."
          ),
        };

      case "confirm-password":
        return {
          heading: "Enter your new password",
          text: "Your new password must be different from previous passwords",
        };

      default:
        return {
          heading: "Welcome",
          text: "Please complete the required information",
        };
    }
  }, [routeType, decodedEmail]);

  return (
    <div className={classes.headingBox}>
      <h1 className={classes.heading}>{content.heading}</h1>
      <p className={classes.text}>{content.text}</p>
    </div>
  );
});

FormHeader.displayName = "FormHeader";

export default FormHeader;
