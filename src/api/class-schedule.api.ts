import { BASE_URL } from "@/services/config";
import { OngoingClasses_Params_Type } from "@/types/class-schedule/getOngoingClasses.types";

export const getOngoingClassesApi = (options: OngoingClasses_Params_Type) => {
  const params = new URLSearchParams();
  if (
    options.student_id !== undefined &&
    typeof options.student_id === "string" &&
    options.student_id !== ""
  ) {
    params.append("student_id", options.student_id);
  }
  if (
    options.tutor_id !== undefined &&
    typeof options.tutor_id === "string" &&
    options.tutor_id !== ""
  ) {
    params.append("tutor_id", options.tutor_id);
  }

  return `${BASE_URL}/api/classSchedule/getOngoingClasses${
    params.toString() ? "?" + params.toString() : ""
  }`;
};

export const classScheduleInstantApi = () =>
  `${BASE_URL}/api/class-schedules/schedule-instant`;

export const extendClassApi = () => `${BASE_URL}/api/class-schedule/extend`;

export const exportAllClassSchedulesApi = () =>
  `${BASE_URL}/api/classSchedulesData`;

export const exportAllClassSchedulesOldApi = () =>
  `${BASE_URL}/api/classSchedulesDataOld`;
