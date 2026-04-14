"use client";
import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import classes from "./layout.module.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MyAxiosError } from "@/services/error.type";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Sidebar from "@/components/ui/dashboard-sidebar/sidebar";
import Header from "@/components/ui/dashboard-header/header";
// import FeedbackModal, {
//   FeedbackData,
// } from "@/components/ui/feedback-modal/feedback-modal";
// import { fetchResources } from "@/lib/store/slices/resources-slice";
// import { fetchRoles } from "@/lib/store/slices/role-slice";
// import { fetchUsersByGroup } from "@/lib/store/slices/usersByGroup-slice";
// import { fetchAllPagesAssignToUser } from "@/lib/store/slices/assignedPages-slice";
// import EnrollmentFeedbackModal from "@/components/ui/teacher/enrollmentFeedback-modal/enrollmentFeedback-modal";
import {
  getAllSessionsForRemainingFeedback,
  createSessionFeedback,
} from "@/services/dashboard/superAdmin/session-feedbacks/session-feedbacks";
import AddFeedbackModal from "@/components/ui/superAdmin/session-feedbacks/addFeedback-modal/addFeedback-modal";
import FcmHandler from "@/components/global/fcm-handler/fcm-handler";
import ErrorBoundary from "@/components/global/error-boundary/error-boundary";

interface LayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<LayoutProps> = memo(({ children }) => {
  // const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state: any) => state.user);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] =
    useState<boolean>(false);
  const isAllowedUser = useMemo(
    () => user?.roleId === 5,
    // || user?.roleId === 3,
    [user],
  );
  const handleFeedbackModal = useCallback(() => {
    if (isFeedbackModalOpen === false) {
      setIsFeedbackModalOpen(true);
    }
  }, [isFeedbackModalOpen]);

  const handleFeedbackModalClose = useCallback(() => {
    if (isFeedbackModalOpen === true) {
      setIsFeedbackModalOpen(false);
    }
  }, [isFeedbackModalOpen]);
  // const [isEnrollmentFeedbackModalOpen, setIsEnrollmentFeedbackModalOpen] =
  //   useState<boolean>(false);

  // const fetchAllData = async () => {
  //   try {
  //     await Promise.all([
  //       dispatch(
  //         fetchAllPagesAssignToUser(user?.roleId, {
  //           token,
  //         }),
  //       ),
  //       dispatch(fetchUsersByGroup({ token }) as any),
  //       dispatch(fetchResources({ token }) as any),
  //       dispatch(fetchRoles({ token }) as any),
  //     ]);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // useEffect(() => {
  //   if (!token) return;
  //   const intervalId = setInterval(() => {
  //     fetchAllData();
  //   }, 120000);
  //   return () => clearInterval(intervalId);
  // }, [dispatch, token]);

  // const handleFeedbackSubmit = (feedback: FeedbackData) => {
  //   // console.log("Feedback submitted:", feedback);
  //   // TODO: Send feedback to your API
  //   // Example:
  //   // await fetch('/api/feedback', {
  //   //   method: 'POST',
  //   //   headers: { 'Content-Type': 'application/json' },
  //   //   body: JSON.stringify(feedback)
  //   // });
  //   // alert("Thank you for your feedback!");
  // };

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["remainingSessionFeedbacks"],
    queryFn: () => getAllSessionsForRemainingFeedback(user?.id, { token }),
    refetchInterval: 300000,
    staleTime: 300000,
    enabled: !!token && isAllowedUser,
  });

  const handleAdd = useMutation({
    mutationFn: (payload: any) =>
      createSessionFeedback(payload, {
        token,
      }),
    onSuccess: (data: any) => {
      if (data.message || data.error) {
        return toast.error(data.message || data.error);
      }
      setIsFeedbackModalOpen(false);
      refetch();
      toast.success("Session Feedback Added Successfully");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message ||
            axiosError?.response?.data?.error ||
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const addFeedBackModalProps = useMemo(
    () => ({
      isOpen: isFeedbackModalOpen,
      handleClose: undefined,
      onSubmit: handleAdd?.mutate,
      isSuccess: handleAdd?.isSuccess,
      loading: handleAdd?.isPending,
      heading: "Give Feedback",
      subHeading: "We would love to hear from you!",
      sessionData: data?.data[0],
      sessionDataLength: data?.data?.length,
    }),
    [
      isFeedbackModalOpen,
      handleAdd.mutate,
      handleAdd.isSuccess,
      handleAdd.isPending,
      data,
    ],
  );

  useEffect(() => {
    if (data?.data?.length > 0 && isAllowedUser) {
      handleFeedbackModal();
    } else if (error || data?.data?.length === 0) {
      handleFeedbackModalClose();
    }
  }, [
    data,
    handleFeedbackModal,
    handleFeedbackModalClose,
    isAllowedUser,
    error,
  ]);

  return (
    <main className={classes.main}>
      <FcmHandler />
      <Sidebar />
      {/* <Sidebar /> */}
      <main className={classes.section}>
        <Header />
        <div className={classes.mainContent}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
        {/* {isAllowedUser && <AddFeedbackModal {...addFeedBackModalProps} />} */}
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
      {/* Feedback Modal */}
      {/* {user?.roleId === 3 && <EnrollmentFeedbackModal />} */}
      {/* <EnrollmentFeedbackModal
        modalOpen={isEnrollmentFeedbackModalOpen}
        heading="Enrollment Feedback"
        subHeading="Fill out the feedback form below."
        handleClose={() => setIsEnrollmentFeedbackModalOpen(false)}
      /> */}
    </main>
  );
});

ProtectedLayout.displayName = "ProtectedLayout";
export default ProtectedLayout;
