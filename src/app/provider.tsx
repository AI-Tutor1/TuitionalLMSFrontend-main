"use client";
import { ReactNode, useRef, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useSelector } from "react-redux";
import { store, persistor } from "@/lib/store/store";
import { PersistGate } from "redux-persist/integration/react";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";
import { setupAxiosInterceptors } from "@/utils/helpers/axios-interceptor";

// Dynamically load ToastContainer with no SSR
const ToastContainerDynamic = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false },
);

// Empty fallback component to avoid hydration mismatch
const EmptyFallback = () => null;

const MainProvider = ({ children }: { children: ReactNode }) => {
  // Use useRef to ensure the same QueryClient instance is used across renders
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  // Client-side only rendering
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    setupAxiosInterceptors();
  }, []);

  // Skip rendering on the server completely
  if (!isMounted) {
    return <EmptyFallback />;
  }

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <QueryClientProvider client={queryClientRef.current}>
          {children}
          <ToastContainerDynamic
            autoClose={2000}
            className="toast"
            position="top-center"
            theme="light"
            style={{ zIndex: 30000 }}
          />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

export default MainProvider;
