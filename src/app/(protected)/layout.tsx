"use client";
import React, { memo } from "react";
import Image from "next/image";
import classes from "./layout.module.css";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Sidebar from "@/components/ui/dashboard-sidebar/sidebar";
import Header from "@/components/ui/dashboard-header/header";
import FcmHandler from "@/components/global/fcm-handler/fcm-handler";
import ErrorBoundary from "@/components/global/error-boundary/error-boundary";

interface LayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<LayoutProps> = memo(({ children }) => {
  const { user, token } = useAppSelector((state: any) => state.user);
  void user;
  void token;

  return (
    <main className={classes.main}>
      <FcmHandler />
      <Sidebar />
      <main className={classes.section}>
        <Header />
        <div className={classes.mainContent}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
      <div className={classes.backgroundImage}>
        <div className={classes.imageBox}>
          <Image
            src="/assets/images/dashboard-background.png"
            alt="background image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
          />
        </div>
      </div>
    </main>
  );
});

ProtectedLayout.displayName = "ProtectedLayout";
export default ProtectedLayout;
