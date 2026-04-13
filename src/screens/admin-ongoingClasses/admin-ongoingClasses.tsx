"use client";
import React, { FC, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import classes from "./admin-ongoingClasses.module.css";
import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { MyAxiosError } from "@/services/error.type";
import { getOngoingClasses } from "@/services/dashboard/superAdmin/class-schedule/getOngoingClasses";
import { extendClass } from "@/services/dashboard/superAdmin/class-schedule/extend-class";
import Card from "./components/card/card";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ExtendClassModal from "@/components/ui/teacher-admin-ongoingClasses-extendClassModal/extendClassModal/extendClassModal";
import { ExtendClassDuration_Payload_Type } from "@/types/extend-class/extendClassDuration.types";
import TicketingModal from "@/components/ui/superAdmin/admin-ongoingclasses/ticketing-modal/ticketing-modal";
import AttendanceModal from "@/components/ui/superAdmin/admin-ongoingclasses/attendance-modal/attendance-modal";
import { ClassScheduleWithStudents } from "@/types/class-schedule/getOngoingClasses.types";
import { CreateTicket_Payload_Type } from "@/types/ticket/ticket.types";
import { createTicket } from "@/services/dashboard/superAdmin/tickets/tickets";

const AdminOngoingClasses: FC = () => {
  const { token } = useAppSelector((state) => state?.user);
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

  const [attendanceModal, setAttendanceModal] = useState<{
    open: boolean;
    item: ClassScheduleWithStudents | null;
  }>({
    open: false,
    item: null,
  });

  const handleTicketingModalCloseModal = useCallback(() => {
    setTicketModal({
      open: false,
      item: null,
    });
  }, []);

  const handleAttendanceModalCloseModal = useCallback(() => {
    setAttendanceModal({
      open: false,
      item: null,
    });
  }, []);

  const handleTicketingModal = useCallback(
    (item: ClassScheduleWithStudents) => {
      setTicketModal({ open: true, item: { ...item } });
    },
    [],
  );

  const handleAttendanceModal = useCallback(
    (item: ClassScheduleWithStudents) => {
      setAttendanceModal({ open: true, item: { ...item } });
    },
    [],
  );

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["getOngoingClasses", token],
    queryFn: () =>
      getOngoingClasses(
        {},
        {
          token,
        },
      ),
    placeholderData: keepPreviousData,
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: !!token,
    refetchOnWindowFocus: false,
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
    <>
      {isLoading ? (
        <LoadingBox inlineStyling={{ gridColumn: "1 / -1" }} />
      ) : data && data?.length === 0 ? (
        <div className={classes.errorBox}>
          <div className={classes.imageBox}>
            <Image
              src="/assets/svgs/boy.svg"
              alt="No ongoing class"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <p className={classes.imageText}>
            There are no classes ongoing at the moment...
          </p>
        </div>
      ) : (
        <div className={classes.ongoingClassBox}>
          {data?.map((classItem: any, index: number) => {
            const { enrollment_reschedual, enrollment } = classItem;
            return (
              <Card
                item={classItem}
                key={classItem.id || index} // Use unique ID instead of index
                students={
                  enrollment?.studentsGroups ||
                  enrollment_reschedual?.studentsGroups
                }
                handleExtendClass={(duration, modalOpen) =>
                  setExtendClassModalOpen({
                    duration,
                    modalOpen,
                    classItem,
                  })
                }
                handleTicketingModal={handleTicketingModal}
                handleAttendanceModal={handleAttendanceModal}
              />
            );
          })}
        </div>
      )}
      <ExtendClassModal
        heading="Extend Class By"
        modalOpen={extendClassModalOpen?.modalOpen}
        duration={extendClassModalOpen?.duration}
        subHeading="Select the duration to extend the class"
        handleClose={() =>
          setExtendClassModalOpen({
            duration: null,
            modalOpen: false,
            classItem: null,
          })
        }
        handleAdd={(extendedDuration: number) => {
          handleExtendClass?.mutate({
            class_schedule_id: extendClassModalOpen?.classItem?.id || null,
            duration: extendedDuration || 0,
            isReschedual: extendClassModalOpen?.classItem?.hasOwnProperty(
              "enrollment_reschedual",
            ),
          });
        }}
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
      <AttendanceModal
        modalOpen={attendanceModal}
        heading="Attendance"
        subHeading="Select the students in order to mark the attendance."
        handleCloseModal={handleAttendanceModalCloseModal}
        handleGenerate={(payload: CreateTicket_Payload_Type) =>
          handleGenerateTicket.mutate(payload)
        }
        loading={handleGenerateTicket?.isPending}
        success={handleGenerateTicket?.isSuccess}
      />
    </>
  );
};

export default AdminOngoingClasses;
