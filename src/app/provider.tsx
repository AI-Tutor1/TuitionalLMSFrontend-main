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

// Loading spinner shown during SSR -> client hydration before providers mount.
const BootstrapLoader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      background: "var(--main-white-color, #fff)",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "3px solid var(--sidebar-border-color, #a0afb8)",
        borderTopColor: "var(--main-blue-color, #38b6ff)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

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
    return <BootstrapLoader />;
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
