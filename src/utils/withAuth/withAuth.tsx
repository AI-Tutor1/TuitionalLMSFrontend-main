"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
  ComponentType,
} from "react";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { toast } from "react-toastify";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store/store";

type RoutePattern = string | RegExp;

interface AssignedPage {
  route: string;
}

interface RoleEntry {
  id: number;
  name: string;
}

const PUBLIC_ROUTES: RoutePattern[] = [
  "/signin",
  "/forgot-password",
  /^\/password-reset(\/.*)?$/,
  /^\/confirm-password(\/.*)?$/,
];

const isMatchingRoute = (path: string, patterns: RoutePattern[]): boolean => {
  if (!patterns || patterns.length === 0) return false;

  return patterns.some((pattern) => {
    if (typeof pattern === "string") {
      return path === pattern || path.startsWith(pattern + "/");
    }
    return pattern.test(path);
  });
};

const createMemoizedRouteChecker = () => {
  const cache = new Map<string, boolean>();

  return (path: string, patterns: RoutePattern[]): boolean => {
    const key = `${path}-${JSON.stringify(patterns)}`;

    if (cache.has(key)) {
      return cache.get(key) as boolean;
    }

    const result = isMatchingRoute(path, patterns);
    cache.set(key, result);

    if (cache.size > 100) {
      cache.clear();
    }

    return result;
  };
};

const memoizedRouteChecker = createMemoizedRouteChecker();

const selectAuthData = createSelector(
  [
    (state: RootState) => state.user.user,
    (state: RootState) => state.user.token,
    (state: RootState) => state.assignedPages.assignedPages,
    (state: RootState) => state.roles.roles,
  ],
  (user, token, assignedPages, ROLES) => ({
    user,
    token,
    assignedPages,
    ROLES,
  }),
);

export const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
): ComponentType<P> => {
  const AuthComponent = memo((props: P) => {
    const { user, token, assignedPages, ROLES } =
      useAppSelector(selectAuthData);

    const router = useRouter();
    const pathname = usePathname();

    // UseRefs to track navigation state
    const hasRedirected = useRef(false);
    const previousPathRef = useRef<string | null>(null);

    // Memoized values for better performance
    const isAuthenticated = useMemo(
      () => Boolean(token && user?.roleId),
      [token, user?.roleId]
    );
    const roleName = useMemo(() => {
      const role = ROLES?.find((role: RoleEntry) => role.id === user?.roleId);
      if (!role?.name) return undefined;
      const words = role.name.split(" ");
      if (words.length === 1) {
        return role.name.toLowerCase();
      }
      return words
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");
    }, [user?.roleId, ROLES]);
    const roleFromPath = useMemo(() => pathname.split("/")[1], [pathname]);

    // Get protected routes for the current role - Updated for dynamic routes
    const protectedRoutePatterns = useMemo<RoutePattern[]>(() => {
      if (!roleName || !assignedPages) return [];
      return assignedPages?.map((item: AssignedPage) => {
        const baseRoute = `/${roleName}${item?.route}`;
        return baseRoute;
      });
    }, [roleName, assignedPages]);

    // Memoized route checking with optimized route checker
    const isPublicRoute = useMemo(
      () => memoizedRouteChecker(pathname, PUBLIC_ROUTES),
      [pathname]
    );

    const isProtectedRoute = useMemo(
      () => memoizedRouteChecker(pathname, protectedRoutePatterns),
      [pathname, protectedRoutePatterns]
    );

    // User's role-based home path
    const roleBasePath = useMemo(
      () => (roleName ? `/${roleName}/dashboard` : "/signin"),
      [roleName]
    );

    // Navigation with toast notification
    const navigateTo = useCallback(
      (
        path: string,
        message?: { type: "success" | "error"; text: string },
      ) => {
        if (message) {
          if (message.type === "success") {
            toast.success(message.text);
          } else {
            toast.error(message.text);
          }
        }
        router.push(path);
      },
      [router],
    );

    // Optimized navigation effect with better performance
    useEffect(() => {
      // Prevent effect from running twice in development
      if (previousPathRef.current === pathname) return;
      previousPathRef.current = pathname;

      // Reset redirect flag when path changes (except for the initial redirect)
      if (pathname !== "/" && hasRedirected.current) {
        hasRedirected.current = false;
      }

      // Use setTimeout to defer navigation to prevent blocking
      const handleNavigation = () => {
        // CASE 1: Initial route handling
        if (pathname === "/") {
          if (isAuthenticated) {
            navigateTo(roleBasePath);
          } else {
            navigateTo("/signin");
          }
          return;
        }

        // Handle authentication-based routing
        if (isAuthenticated) {
          // User is authenticated

          // CASE 2 & 4: Prevent authenticated users from accessing public routes
          if (isPublicRoute) {
            navigateTo(roleBasePath, {
              type: "error",
              text: "You are already logged in. Redirecting to your dashboard.",
            });
            return;
          }

          // CASE 5: Prevent access to other roles' routes
          if (
            roleFromPath &&
            roleName &&
            roleFromPath !== roleName &&
            !isPublicRoute
          ) {
            navigateTo(roleBasePath, {
              type: "error",
              text: "Unauthorized access. Redirecting to your dashboard.",
            });
            return;
          }

          // CASE 6: Check if authenticated user has access to this protected route
          if (
            !isPublicRoute &&
            !isProtectedRoute &&
            assignedPages &&
            assignedPages.length > 0
          ) {
            navigateTo(roleBasePath, {
              type: "error",
              text: "You don't have access to this page. Redirecting to your dashboard.",
            });
            return;
          }
        } else {
          // User is not authenticated

          // CASE 3: Block unauthenticated access to protected routes
          if (!isPublicRoute) {
            navigateTo("/signin", {
              type: "error",
              text: "Access denied. Please sign in.",
            });
            return;
          }
        }
      };

      // Defer navigation to prevent blocking
      const timeoutId = setTimeout(handleNavigation, 0);
      return () => clearTimeout(timeoutId);
    }, [
      pathname,
      isAuthenticated,
      roleName,
      roleFromPath,
      roleBasePath,
      isPublicRoute,
      isProtectedRoute,
      navigateTo,
      assignedPages,
    ]);

    // Only render the component if access is allowed
    const isAllowedAccess = useMemo(() => {
      // Allow public routes
      if (isPublicRoute) return true;

      // Require authentication for non-public routes
      if (!isAuthenticated) return false;

      // If we haven't loaded assignedPages yet, allow access (loading state)
      if (!assignedPages || (assignedPages as unknown as unknown[]).length === 0)
        return true;

      // Check if user has access to this protected route
      return isProtectedRoute;
    }, [isPublicRoute, isAuthenticated, assignedPages, isProtectedRoute]);

    return isAllowedAccess ? <WrappedComponent {...props} /> : null;
  });

  // Set display name for better debugging
  AuthComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthComponent as unknown as ComponentType<P>;
};

export default withAuth;
