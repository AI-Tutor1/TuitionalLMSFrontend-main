import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import moment from "moment";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { getEnrollmentByGroupId } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { cancelClassScheduleForWeek } from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id";
import TeacherExtraSceduleAddModal from "@/components/ui/superAdmin/enrollment-details/teacherExtraSchedule-modal/teacherExtraSchedule-modal";

const dayNames: any = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export default function EnrollmentExtraClassModalWrapper({ open, id, onClose }: Props) {
  const { token, user } = useAppSelector((state) => state?.user);
  const [transformedSchedules, setTransformedSchedules] = useState<any>([]);

  const transformClassSchedules = useCallback((classSchedules: any) => {
    const sortByStartTime = (arr: any[]) =>
      arr.sort((a, b) => {
        const localTimeA = moment
          .utc(a?.teacher_schedule?.start_time, "HH:mm:ss")
          .local();
        const localTimeB = moment
          .utc(b?.teacher_schedule?.start_time, "HH:mm:ss")
          .local();
        return localTimeA.isBefore(localTimeB) ? -1 : 1;
      });

    const updatedSchedules: Record<string, any[]> = dayOrder.reduce(
      (acc: Record<string, any[]>, day: string) => {
        acc[day] = [];
        return acc;
      },
      {},
    );
    Object.keys(classSchedules).forEach((day: string) => {
      if (day === "undefined" || !day) return;

      classSchedules[day]?.forEach((schedule: any) => {
        if (!schedule?.teacher_schedule?.start_time) return;

        const startTimeUTC = moment.utc(
          `${dayNames[day]} ${schedule.teacher_schedule.start_time}`,
          "ddd HH:mm:ss",
        );
        const localStartTime = startTimeUTC.clone().local();
        const localDayOfWeek = localStartTime.format("ddd");

        schedule.teacher_schedule.start_time = localStartTime.format("HH:mm:ss");
        schedule.teacher_schedule.day_of_week = localDayOfWeek;

        const localDayKey = Object.keys(dayNames).find(
          (key) => dayNames[key].substr(0, 3) === localDayOfWeek,
        );

        if (localDayKey) {
          updatedSchedules[localDayKey].push(schedule);
        }
      });
    });

    const todayKey = moment().format("ddd");
    const reorderedDayOrder = [
      ...dayOrder.slice(dayOrder.indexOf(todayKey)),
      ...dayOrder.slice(0, dayOrder.indexOf(todayKey)),
    ];

    const todayDate = moment();

    const transformed = reorderedDayOrder.map((day: string, index: number) => ({
      date: todayDate.clone().add(index, "days").format("YYYY-MM-DD"),
      key: day,
      name: dayNames[day],
      slotsArr: sortByStartTime(updatedSchedules[day]),
    }));

    setTransformedSchedules(transformed);
  }, []);

  const { data, isFetching } = useQuery<any>({
    queryKey: ["getEnrollmentByGroupId_ExtraClass", id],
    queryFn: () => getEnrollmentByGroupId(id as string, { token }),
    enabled: !!id && !!token && open,
  });

  useEffect(() => {
    if (data?.classSchedules) {
      transformClassSchedules(data?.classSchedules);
    }
  }, [data, transformClassSchedules]);

  const handleAddExtraClass = useMutation({
    mutationFn: (payload: any) => cancelClassScheduleForWeek(payload, { token }),
    onSuccess: (resData) => {
      if (resData && "newRescheduleRequest" in resData) {
        toast.success("Extra Slot added successfully.");
        onClose();
      } else {
        toast.success("Class Schedule deleted successfully for the week");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message);
    },
  });

  return (
    <TeacherExtraSceduleAddModal
      heading="Add Teacher Extra Schedule"
      subHeading="Fill out the form in order to create the extra teacher schedule."
      modalOpen={{ open, transformedSchedulesArr: transformedSchedules }}
      handleClose={onClose}
      success={handleAddExtraClass.isSuccess}
      loading={handleAddExtraClass.isPending || isFetching}
      handleAdd={(payload: any) =>
        handleAddExtraClass.mutate({
          ...payload,
          user_id: user?.roleId || null,
          enrollment_id: id || null,
          class_status: "SCHEDULED",
        })
      }
    />
  );
}
