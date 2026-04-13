import React, { FC, useEffect, useState, memo, useCallback } from "react";
import styles from "./ongoing-class.module.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { toast } from "react-toastify";
import Card from "./components/card/card";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { MyAxiosError } from "@/services/error.type";
import { getOngoingClasses } from "@/services/dashboard/superAdmin/class-schedule/getOngoingClasses";
import ErrorBox from "@/components/global/error-box/error-box";
import { extendClass } from "@/services/dashboard/superAdmin/class-schedule/extend-class";
import ExtendClassModal from "@/components/ui/teacher-admin-ongoingClasses-extendClassModal/extendClassModal/extendClassModal";
import { ExtendClassDuration_Payload_Type } from "@/types/extend-class/extendClassDuration.types";
import { ClassJoinTracking_Payload_Type } from "@/types/join-class-tracking/joinClassTracking.types";
import { classJoinTracking } from "@/services/dashboard/superAdmin/class-join-tracking/class-join-tracking";
import { ClassScheduleWithStudents } from "@/types/class-schedule/getOngoingClasses.types";
import TicketingModal from "@/components/ui/superAdmin/admin-ongoingclasses/ticketing-modal/ticketing-modal";
import { CreateTicket_Payload_Type } from "@/types/ticket/ticket.types";
import { createTicket } from "@/services/dashboard/superAdmin/tickets/tickets";

interface OngoingClassProps {
  inLineStyles?: React.CSSProperties;
}

const OngoingClass: FC<OngoingClassProps> = ({ inLineStyles }) => {
  const { token, user, childrens } = useAppSelector(
    (state: any) => state?.user,
  );
  const [extendClassModalOpen, setExtendClassModalOpen] = useState<{
    duration: number | null;
    modalOpen: boolean;
    classItem?: any; // Optional, if you need to pass the class item to the modal
  }>({
    duration: null,
    modalOpen: false,
    classItem: null,
  });
  const [ticketModal, setTicketModal] = useState<{
    open: boolean;
    item: ClassScheduleWithStudents | null;
  }>({
    open: false,
    item: null,
  });

  const handleTicketingModal = useCallback(
    (item: ClassScheduleWithStudents) => {
      setTicketModal({ open: true, item: { ...item } });
    },
    [],
  );

  const handleTicketingModalCloseModal = useCallback(() => {
    setTicketModal({
      open: false,
      item: null,
    });
  }, []);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["getOngoingClasses"],
    queryFn: () =>
      getOngoingClasses(
        {
          student_id:
            user?.roleId === 3
              ? String(user?.id || "")
              : user?.roleId === 4
                ? childrens?.map((i: any) => i.id).join(",")
                : "",
          tutor_id: user?.roleId === 5 ? String(user?.id || "") : "",
        },
        {
          token,
        },
      ),
    refetchOnWindowFocus: false,
    enabled: !!token && !!user?.id && !!user?.roleId,
    staleTime: 300000,
    refetchInterval: 300000,
  });

  const handleExtendClass = useMutation({
    mutationFn: (payload: ExtendClassDuration_Payload_Type) =>
      extendClass(payload, {
        token,
      }),
    onSuccess: (data: any) => {
      refetch();
      setExtendClassModalOpen({
        duration: null,
        modalOpen: false,
        classItem: null,
      });
      if (data.message) {
        return toast.success(data.message);
      }
      if (data.error) {
        return toast.error(data.error);
      }

      return toast.success("Class Extended Successfully");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? `${axiosError?.response?.data?.message}`
            : axiosError?.response?.data?.error
              ? `${axiosError?.response?.data?.error}`
              : `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleGenerateTicket = useMutation({
    mutationFn: (payload: CreateTicket_Payload_Type) =>
      createTicket(payload, {
        token,
      }),
    onSuccess: (data: any) => {
      refetch();
      setTicketModal({
        open: false,
        item: null,
      });
      if (data.message) {
        return toast.success(data.message);
      } else {
        return toast.success("Ticket Generated Successfully");
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? `${axiosError?.response?.data?.message}`
            : axiosError?.response?.data?.error
              ? `${axiosError?.response?.data?.error}`
              : `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleClassJoinTracking = useMutation({
    mutationFn: (payload: ClassJoinTracking_Payload_Type) =>
      classJoinTracking({ token }, payload),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
        return;
      }
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response
          ? `${error.response.status} ${error.response.statusText}`
          : error.message);

      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error(axiosError.message);
      }
    }
  }, [error]);

  return (
    <div className={styles.ongoingClassBox} style={inLineStyles}>
      <p className={styles.heading}>Ongoing Class</p>
      {isLoading ? (
        <LoadingBox inlineStyling={{ flex: 1 }} />
      ) : data && data?.length > 0 ? (
        <div className={styles.innerBox}>
          {data.map((classItem: any, index: number) => (
            <Card
              key={index}
              classItem={classItem}
              handleExtendClass={(duration, modalOpen) =>
                setExtendClassModalOpen({
                  duration,
                  modalOpen,
                  classItem,
                })
              }
              handleClassJoinTracking={handleClassJoinTracking.mutate}
              handleClassJoinTrackingSuccess={handleClassJoinTracking.isSuccess}
              handleClassJoinTrackingLoading={handleClassJoinTracking.isPending}
              handleTicketingModal={handleTicketingModal}
            />
          ))}
        </div>
      ) : (
        <ErrorBox
          message="No ongoing classes at the moment..."
          inlineStyling={{
            flex: 1,
            fontFamily: "var(--leagueSpartan-bold-700)",
            fontSize: "var(--regular20-)",
            lineHeight: "var(--regular20-)",
          }}
        />
      )}
      <ExtendClassModal
        heading="Extend Class By"
        modalOpen={extendClassModalOpen?.modalOpen}
        duration={extendClassModalOpen?.duration}
        subHeading="Select the duration to extend the class"
        handleAdd={(extendedDuration: number) => {
          handleExtendClass?.mutate({
            class_schedule_id: extendClassModalOpen?.classItem?.id || null,
            duration: extendedDuration || 0,
            isReschedual: extendClassModalOpen?.classItem?.hasOwnProperty(
              "enrollment_reschedual",
            )
              ? true
              : false,
          });
        }}
        handleClose={() =>
          setExtendClassModalOpen({
            duration: null,
            modalOpen: false,
            classItem: null,
          })
        }
        success={handleExtendClass?.isSuccess}
        loading={handleExtendClass?.isPending}
      />
      <TicketingModal
        modalOpen={ticketModal}
        heading="Generate Ticket"
        subHeading="Generate Ticket"
        handleCloseModal={handleTicketingModalCloseModal}
        handleGenerate={(payload: CreateTicket_Payload_Type) =>
          handleGenerateTicket.mutate(payload)
        }
        loading={handleGenerateTicket?.isPending}
        success={handleGenerateTicket?.isSuccess}
      />
    </div>
  );
};

export default memo(OngoingClass);
