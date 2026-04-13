import React from "react";
import FormHeader from "./_components/form-header/form-header";
import Image from "next/image";
import classes from "./layout.module.css";
import {
  GraduationCap,
  Users,
  Calendar,
  DollarSign,
  Shield,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle/theme-toggle";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ email?: string }>;
}

// Memoized static image props at module level to be shared across renders
const LOGO_IMAGE_PROPS = Object.freeze({
  src: "/assets/svgs/logo.svg",
  alt: "icon",
  fill: true,
  sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority: true,
});

const GREETING_IMAGE_PROPS = Object.freeze({
  src: "/assets/images/greeting.png",
  alt: "Greeting Image",
  fill: true,
  sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  loading: "eager" as const,
});

const MAIN_PIC_IMAGE_PROPS = Object.freeze({
  src: "/assets/svgs/mainPic.svg",
  alt: "Main Image",
  fill: true,
  sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority: true,
});

// Create memoized components for each section
const LogoSection = React.memo(() => (
  <div className={classes.logoContainer}>
    <div className={classes.iconBox}>
      <Image {...LOGO_IMAGE_PROPS} />
    </div>
    <ThemeToggle />
  </div>
));
// LogoSection.displayName = "LogoSection";

const BannerImages = React.memo(() => (
  <div className={classes.signinBannerBox}>
    <div className={classes.heading}>
      <Image {...GREETING_IMAGE_PROPS} />
    </div>
    <div className={classes.mainPic}>
      <Image {...MAIN_PIC_IMAGE_PROPS} />
    </div>
  </div>
));
BannerImages.displayName = "BannerImages";

// Main component
const PublicLayout = React.memo(async ({ children, params }: LayoutProps) => {
  return (
    <main className={classes.mainContainer}>
      <div className={classes.signinFormBox}>
        <div className={classes.conatiner}>
          <LogoSection />
          <FormHeader />
          {children}
        </div>
      </div>
      <div className={classes.rightSideContainer}>
        <Image
          src="/assets/svgs/mainPic.svg"
          alt="Main Image"
          width={0}
          height={0}
          className={classes.backgroundImage}
          priority={true}
        />
        <div className={classes.titleContainer}>
          <h1 className={classes.title}>Tuitional LMS Pro</h1>
          <p className={classes.subtitle}>School Management System</p>
        </div>
        <div className={classes.descriptionContainer}>
          <h2 className={classes.descriptionTitle}>
            Complete School Management Solution
          </h2>
          <p className={classes.descriptionText}>
            Streamline admissions, attendance, academics, and administration
            with our comprehensive platform designed for traditional schools.
          </p>
        </div>
        <div className={classes.featuresGrid}>
          <div className={classes.featureItem}>
            <Users className={classes.iconBlue} />
            <span className={classes.featureText}>Student Management</span>
          </div>
          <div className={classes.featureItem}>
            <BookOpen className={classes.iconGreen} />
            <span className={classes.featureText}>Academic Records</span>
          </div>
          <div className={classes.featureItem}>
            <Calendar className={classes.iconPurple} />
            <span className={classes.featureText}>Attendance Tracking</span>
          </div>
          <div className={classes.featureItem}>
            <DollarSign className={classes.iconYellow} />
            <span className={classes.featureText}>Fee Management</span>
          </div>
          <div className={classes.featureItem}>
            <Shield className={classes.iconRed} />
            <span className={classes.featureText}>Security & Safety</span>
          </div>
          <div className={classes.emptyGridCell}></div>
          <div className={classes.featureItem}>
            <GraduationCap className={classes.iconIndigo} />
            <span className={classes.featureText}>Exam Management</span>
          </div>
        </div>
      </div>
    </main>
  );
});

// Set display name for better debugging
PublicLayout.displayName = "PublicLayout";

// Export with higher-order component
export default PublicLayout;
