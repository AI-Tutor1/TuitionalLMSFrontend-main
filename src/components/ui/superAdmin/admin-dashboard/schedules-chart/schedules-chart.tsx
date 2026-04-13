// import React, { useCallback, useId, useMemo, useState } from "react";
// import moment from "moment";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   TooltipProps,
// } from "recharts";
// import classes from "./schedules-chart.module.css";
// import ChartContainer from "../chartContainer/chartContainer";
// import LoadingBox from "@/components/global/loading-box/loading-box";
// import ErrorBox from "@/components/global/error-box/error-box";
// import { getAllClassSchedules } from "@/services/dashboard/superAdmin/class-schedule/class-schedule-groupedByDay/clas-schedule-groupedByDay";
// import { useQuery } from "@tanstack/react-query";
// import { useAppSelector } from "@/lib/store/hooks/hooks";
// import { rescheduleRequest } from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id";
// import SessionChartModal from "../session-chart-modal/session-chart-modal";

// // ============================================================================
// // TYPE DEFINITIONS (matching calendar component)
// // ============================================================================

// export type StudentGroup = {
//   id: number;
//   student_id: number;
//   enrollment_id: number;
//   user: {
//     name: string;
//     id: number;
//     email: string;
//     profileImageUrl: string;
//     country_code: string;
//   };
// };

// export type TeacherSchedule = {
//   id: number;
//   day_of_week: string;
//   start_time: string;
//   session_duration: number;
//   status: boolean;
//   slots: string;
//   is_booked: boolean;
// };

// export type Subject = {
//   id: number;
//   name: string;
//   status: boolean;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
// };

// export type Board = {
//   id: number;
//   name: string;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
// };

// export type Curriculum = {
//   id: number;
//   name: string;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
// };

// export type Grade = {
//   id: number;
//   name: string;
//   status: boolean;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
// };

// export type Tutor = {
//   name: string;
//   id: number;
//   email: string;
//   profileImageUrl: string;
//   country_code: string;
// };

// export type Enrollment = {
//   id: number;
//   status: number;
//   on_break: boolean;
//   hourly_rate: number;
//   tutor_hourly_rate: number;
//   group_id: string;
//   tutor: Tutor;
//   subject: Subject;
//   board: Board;
//   curriculum: Curriculum;
//   grade: Grade;
//   studentsGroups: StudentGroup[];
//   students?: Array<{ id: number; name: string }>;
// };

// // Matching the Event type from calendar component
// export type ClassScheduleItem = {
//   id: number;
//   status: boolean | "CANCELLED" | "SCHEDULED" | string;
//   enrollment: Enrollment;
//   teacherSchedule: TeacherSchedule;
// };

// // For reschedule requests (extra slots)
// export type RescheduleRequestItem = {
//   id: number;
//   class_status: "CANCELLED" | "SCHEDULED" | string;
//   DateTime: string;
//   duration?: number;
//   enrollment: Enrollment;
// };

// // Combined event type (matching calendar's Event interface)
// export type CalendarEvent = {
//   type: "normal slot" | "extra slot";
//   id: number;
//   status?: "CANCELLED" | "SCHEDULED" | boolean | string;
//   start: Date;
//   end: Date;
//   title?: string;
//   slotData: {
//     id: number;
//     class_status?: "CANCELLED" | "SCHEDULED" | string;
//     enrollment?: Enrollment;
//     teacherSchedule?: TeacherSchedule;
//     DateTime?: string;
//     duration?: number;
//   };
// };

// export type ClassSchedulesByDay = {
//   [dayKey: string]: ClassScheduleItem[];
// };

// export type ProcessedDayData = {
//   dayName: string;
//   dayIndex: number;
//   totalSchedules: number;
//   onBreak: number;
//   cancelled: number;
//   scheduled: number;
//   active: number;
// };

// export type ChartConfig = {
//   [key: string]: {
//     label: string;
//     color: string;
//     textColor: string;
//   };
// };

// export type FilterType =
//   | "onBreak"
//   | "cancelled"
//   | "scheduled"
//   | "active"
//   | null;

// export type ScheduleTotals = {
//   totalSchedules: number;
//   onBreak: number;
//   cancelled: number;
//   scheduled: number;
//   active: number;
// };

// interface CustomTooltipProps extends TooltipProps<number, string> {
//   active?: boolean;
//   payload?: Array<{
//     value: number;
//     name: string;
//     color: string;
//     dataKey: string;
//     payload: ProcessedDayData;
//   }>;
//   label?: string;
//   chartConfig: ChartConfig;
// }

// interface SessionsChartProps {
//   inLineStyles?: React.CSSProperties;
// }

// // ============================================================================
// // CONSTANTS
// // ============================================================================

// const DAY_ORDER: { [key: string]: number } = {
//   Mon: 1,
//   Tue: 2,
//   Wed: 3,
//   Thu: 4,
//   Fri: 5,
//   Sat: 6,
//   Sun: 7,
// };

// const DAY_FULL_NAMES: { [key: string]: string } = {
//   Mon: "Monday",
//   Tue: "Tuesday",
//   Wed: "Wednesday",
//   Thu: "Thursday",
//   Fri: "Friday",
//   Sat: "Saturday",
//   Sun: "Sunday",
// };

// /**
//  * Chart config matching getEventStyles colors exactly from calendar component:
//  *
//  * const backgroundColor = isOnBreak
//  *   ? "var(--grey-color1)"
//  *   : isInactive
//  *   ? "var(--red-background-color1)"
//  *   : isScheduled
//  *   ? "var(--green-background-color5)"
//  *   : "var(--light-blue)";
//  *
//  * const borderColor = isOnBreak
//  *   ? "var(--text-grey)"
//  *   : isInactive
//  *   ? "var(--red-color)"
//  *   : isScheduled
//  *   ? "var(--green-text-color2)"
//  *   : "var(--main-blue-color)";
//  */
// export const chartConfigData: ChartConfig = {
//   onBreak: {
//     label: "On Break",
//     color: "var(--grey-color1)",
//     textColor: "var(--text-grey)",
//   },
//   cancelled: {
//     label: "Cancelled",
//     color: "var(--red-background-color1)",
//     textColor: "var(--red-color)",
//   },
//   scheduled: {
//     label: "Scheduled",
//     color: "var(--green-background-color5)",
//     textColor: "var(--green-text-color2)",
//   },
//   active: {
//     label: "Active",
//     color: "var(--light-blue)",
//     textColor: "var(--main-blue-color)",
//   },
// };

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================

// /**
//  * Determines the schedule status based on the event data
//  * This mirrors the getEventStyles logic from calendar.tsx EXACTLY:
//  *
//  * const isInactive =
//  *   event?.status === "CANCELLED" ||
//  *   event?.slotData?.class_status === "CANCELLED";
//  * const isScheduled =
//  *   event?.status === "SCHEDULED" ||
//  *   event?.slotData?.class_status === "SCHEDULED";
//  * const isOnBreak = event?.slotData?.enrollment?.on_break === true;
//  */
// const getEventStatus = (
//   event: CalendarEvent
// ): "onBreak" | "cancelled" | "scheduled" | "active" => {
//   // Check conditions exactly as in calendar component's getEventStyles
//   const isInactive =
//     event?.status === "CANCELLED" ||
//     event?.slotData?.class_status === "CANCELLED";

//   const isScheduled =
//     event?.status === "SCHEDULED" ||
//     event?.slotData?.class_status === "SCHEDULED";

//   const isOnBreak = event?.slotData?.enrollment?.on_break === true;

//   // Priority order from getEventStyles: onBreak -> cancelled -> scheduled -> active
//   if (isOnBreak) {
//     return "onBreak";
//   } else if (isInactive) {
//     return "cancelled";
//   } else if (isScheduled) {
//     return "scheduled";
//   } else {
//     return "active";
//   }
// };

// const normalizeDayKey = (day: string): string => {
//   if (!day || typeof day !== "string") return "";

//   const lowercased = day.toLowerCase();

//   const fullDayMap: { [key: string]: string } = {
//     monday: "Mon",
//     tuesday: "Tue",
//     wednesday: "Wed",
//     thursday: "Thu",
//     friday: "Fri",
//     saturday: "Sat",
//     sunday: "Sun",
//   };

//   if (fullDayMap[lowercased]) {
//     return fullDayMap[lowercased];
//   }

//   return day.charAt(0).toUpperCase() + day.slice(1, 3).toLowerCase();
// };

// /**
//  * Converts class schedules data to calendar events format
//  * Matching the refactorClassSchedule logic from class-calendar.tsx
//  */
// const convertToCalendarEvents = (
//   classSchedulesData: ClassSchedulesByDay | null,
//   rescheduleRequestData: RescheduleRequestItem[] | null,
//   dateFilter: [string, string] | null
// ): CalendarEvent[] => {
//   const events: CalendarEvent[] = [];

//   // Helper function from class-calendar.tsx
//   const getNextDateForDay = (
//     dayOfWeek: string,
//     time: string,
//     offsetDays = 0
//   ) => {
//     const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const today = new Date();
//     const currentDay = today.getDay();
//     const targetDay = daysOfWeek.indexOf(dayOfWeek);
//     let daysUntilNext = (targetDay + 7 - currentDay) % 7;
//     if (daysUntilNext === 0) daysUntilNext = 7;

//     const nextDate = new Date(today);
//     nextDate.setDate(today.getDate() + daysUntilNext + offsetDays);

//     const [hours, minutes, seconds] = time.split(":").map(Number);
//     nextDate.setUTCHours(hours, minutes, seconds, 0);

//     return new Date(
//       nextDate.toLocaleString("en-US", {
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       })
//     );
//   };

//   // Process normal slots (from classSchedulesData)
//   if (classSchedulesData && typeof classSchedulesData === "object") {
//     const result = Object.entries(classSchedulesData).flatMap(([key, items]) =>
//       items.map((item) => ({ ...item, day: key }))
//     );

//     const normalSlotEvents = result?.flatMap((item: any) =>
//       Array.from({ length: 5 }, (_, i) => {
//         const startDate = getNextDateForDay(
//           item.teacherSchedule.day_of_week,
//           item.teacherSchedule.start_time,
//           (i - 1) * 7
//         );
//         const endDate = new Date(startDate);
//         endDate.setMinutes(
//           startDate.getMinutes() + item.teacherSchedule.session_duration
//         );

//         return {
//           type: "normal slot" as const,
//           id: item.id,
//           status: item.status,
//           start: startDate,
//           end: endDate,
//           title: ` ${
//             item.enrollment?.studentsGroups[0]?.user?.name
//               ?.trim()
//               .split(" ")[0] || "No Show"
//           } x ${
//             item.enrollment?.tutor?.name?.trim()?.split(" ")[0] || "No Show"
//           }`,
//           slotData: item,
//         };
//       })
//     );

//     events.push(...normalSlotEvents);
//   }

//   // Process extra slots (from rescheduleRequestData)
//   if (rescheduleRequestData && Array.isArray(rescheduleRequestData)) {
//     const extraSlotEvents = rescheduleRequestData.map((item: any) => ({
//       type: "extra slot" as const,
//       id: item.id,
//       start: moment.utc(item.DateTime).local().toDate(),
//       end: moment.utc(item.DateTime).local().add(60, "minutes").toDate(),
//       status: item.class_status,
//       title: ` ${
//         item.enrollment?.students[0]?.name?.split(" ")[0].trim() || "No Show"
//       } X ${item.enrollment?.tutor?.name.split(" ")[0].trim() || "No Show"}`,
//       slotData: item,
//     }));

//     events.push(...extraSlotEvents);
//   }

//   // Apply date filter if available
//   if (dateFilter && dateFilter.length === 2 && dateFilter[0] && dateFilter[1]) {
//     const filterStartDate = moment(dateFilter[0]).startOf("day").toDate();
//     const filterEndDate = moment(dateFilter[1]).endOf("day").toDate();

//     return events.filter((event) => {
//       const eventDate = new Date(event.start);
//       return eventDate >= filterStartDate && eventDate <= filterEndDate;
//     });
//   }

//   return events;
// };

// /**
//  * Process calendar events into chart data grouped by day of week
//  */
// export const processCalendarEventsToChartData = (
//   events: CalendarEvent[]
// ): ProcessedDayData[] => {
//   const dayDataMap: { [key: string]: ProcessedDayData } = {};

//   // Initialize all days
//   Object.keys(DAY_ORDER).forEach((day) => {
//     dayDataMap[day] = {
//       dayName: day,
//       dayIndex: DAY_ORDER[day],
//       totalSchedules: 0,
//       onBreak: 0,
//       cancelled: 0,
//       scheduled: 0,
//       active: 0,
//     };
//   });

//   // Process each event
//   events.forEach((event) => {
//     const eventDay = moment(event.start).format("ddd"); // Get day abbreviation (Mon, Tue, etc.)
//     const normalizedDay = normalizeDayKey(eventDay);

//     if (!dayDataMap[normalizedDay]) return;

//     dayDataMap[normalizedDay].totalSchedules += 1;

//     // Get status using the same logic as calendar's getEventStyles
//     const status = getEventStatus(event);
//     dayDataMap[normalizedDay][status] += 1;
//   });

//   return Object.values(dayDataMap).sort((a, b) => a.dayIndex - b.dayIndex);
// };

// export const filterSchedulesByDay = (
//   schedulesByDay: ClassSchedulesByDay | any,
//   filters: {
//     selectedBoards: string[];
//     selectedGrades: string[];
//     selectedCurriculums: string[];
//     selectedSubjects: string[];
//     selectedTeachers: string[];
//     selectedStudents: string[];
//   }
// ): ClassSchedulesByDay => {
//   const {
//     selectedBoards,
//     selectedGrades,
//     selectedCurriculums,
//     selectedSubjects,
//     selectedTeachers,
//     selectedStudents,
//   } = filters;

//   const hasFilters =
//     selectedBoards.length > 0 ||
//     selectedGrades.length > 0 ||
//     selectedCurriculums.length > 0 ||
//     selectedSubjects.length > 0 ||
//     selectedTeachers.length > 0 ||
//     selectedStudents.length > 0;

//   if (!hasFilters) return schedulesByDay;

//   const filteredData: ClassSchedulesByDay = {};

//   Object.entries(schedulesByDay).forEach(([day, schedules]) => {
//     if (!Array.isArray(schedules)) return;

//     const filteredSchedules = schedules.filter((schedule) => {
//       const enrollment = schedule.enrollment;
//       if (!enrollment) return false;

//       if (selectedBoards.length > 0) {
//         const boardId = enrollment.board?.id?.toString();
//         if (!boardId || !selectedBoards.includes(boardId)) return false;
//       }

//       if (selectedGrades.length > 0) {
//         const gradeId = enrollment.grade?.id?.toString();
//         if (!gradeId || !selectedGrades.includes(gradeId)) return false;
//       }

//       if (selectedCurriculums.length > 0) {
//         const curriculumId = enrollment.curriculum?.id?.toString();
//         if (!curriculumId || !selectedCurriculums.includes(curriculumId))
//           return false;
//       }

//       if (selectedSubjects.length > 0) {
//         const subjectId = enrollment.subject?.id?.toString();
//         if (!subjectId || !selectedSubjects.includes(subjectId)) return false;
//       }

//       if (selectedTeachers.length > 0) {
//         const tutorId = enrollment.tutor?.id?.toString();
//         if (!tutorId || !selectedTeachers.includes(tutorId)) return false;
//       }

//       if (selectedStudents.length > 0) {
//         const studentIds = enrollment.studentsGroups?.map((sg: any) =>
//           sg.user?.id?.toString()
//         );
//         if (
//           !studentIds ||
//           !studentIds.some((id: any) => id && selectedStudents.includes(id))
//         ) {
//           return false;
//         }
//       }

//       return true;
//     });

//     if (filteredSchedules.length > 0) {
//       filteredData[day] = filteredSchedules;
//     }
//   });

//   return filteredData;
// };

// export const calculateYAxisMax = (
//   data: ProcessedDayData[],
//   activeFilter: FilterType
// ): number => {
//   if (!data || data.length === 0) return 10;

//   let maxValue = 0;

//   data.forEach((day) => {
//     let dayMax = 0;

//     if (activeFilter === null) {
//       dayMax = Math.max(day.onBreak, day.cancelled, day.scheduled, day.active);
//     } else {
//       dayMax = day[activeFilter] || 0;
//     }

//     if (dayMax > maxValue) {
//       maxValue = dayMax;
//     }
//   });

//   if (maxValue === 0) return 10;

//   if (maxValue <= 20) {
//     return Math.ceil(maxValue / 5) * 5;
//   }
//   return Math.ceil(maxValue / 10) * 10;
// };

// export const generateYAxisTicks = (maxValue: number): number[] => {
//   if (maxValue <= 0) return [0, 5, 10];

//   const ticks: number[] = [];
//   const step = maxValue <= 20 ? 5 : 10;

//   for (let i = 0; i <= maxValue; i += step) {
//     ticks.push(i);
//   }

//   return ticks;
// };

// export const calculateTotals = (data: ProcessedDayData[]): ScheduleTotals => {
//   return data.reduce(
//     (acc, item) => ({
//       totalSchedules: acc.totalSchedules + item.totalSchedules,
//       onBreak: acc.onBreak + item.onBreak,
//       cancelled: acc.cancelled + item.cancelled,
//       scheduled: acc.scheduled + item.scheduled,
//       active: acc.active + item.active,
//     }),
//     {
//       totalSchedules: 0,
//       onBreak: 0,
//       cancelled: 0,
//       scheduled: 0,
//       active: 0,
//     }
//   );
// };

// const getXAxisTicks = (data: ProcessedDayData[]): number[] => {
//   return data.map((d) => d.dayIndex);
// };

// const formatDayIndex = (dayIndex: number): string => {
//   const dayEntry = Object.entries(DAY_ORDER).find(
//     ([, idx]) => idx === dayIndex
//   );
//   return dayEntry ? dayEntry[0] : "";
// };

// const getFullDayName = (dayName: string): string => {
//   return DAY_FULL_NAMES[dayName] || dayName;
// };

// export const extractUniqueBoards = (
//   schedulesByDay: ClassSchedulesByDay
// ): Array<{ id: string; name: string }> => {
//   const boardsMap = new Map<string, string>();

//   Object.values(schedulesByDay).forEach((schedules) => {
//     if (!Array.isArray(schedules)) return;

//     schedules.forEach((schedule) => {
//       const board = schedule.enrollment?.board;
//       if (board?.id && board?.name) {
//         boardsMap.set(board.id.toString(), board.name);
//       }
//     });
//   });

//   return Array.from(boardsMap.entries()).map(([id, name]) => ({ id, name }));
// };

// export const extractUniqueGrades = (
//   schedulesByDay: ClassSchedulesByDay
// ): Array<{ id: string; name: string }> => {
//   const gradesMap = new Map<string, string>();

//   Object.values(schedulesByDay).forEach((schedules) => {
//     if (!Array.isArray(schedules)) return;

//     schedules.forEach((schedule) => {
//       const grade = schedule.enrollment?.grade;
//       if (grade?.id && grade?.name) {
//         gradesMap.set(grade.id.toString(), grade.name);
//       }
//     });
//   });

//   return Array.from(gradesMap.entries()).map(([id, name]) => ({ id, name }));
// };

// export const extractUniqueCurriculums = (
//   schedulesByDay: ClassSchedulesByDay
// ): Array<{ id: string; name: string }> => {
//   const curriculumsMap = new Map<string, string>();

//   Object.values(schedulesByDay).forEach((schedules) => {
//     if (!Array.isArray(schedules)) return;

//     schedules.forEach((schedule) => {
//       const curriculum = schedule.enrollment?.curriculum;
//       if (curriculum?.id && curriculum?.name) {
//         curriculumsMap.set(curriculum.id.toString(), curriculum.name);
//       }
//     });
//   });

//   return Array.from(curriculumsMap.entries()).map(([id, name]) => ({
//     id,
//     name,
//   }));
// };

// export const extractUniqueSubjects = (
//   schedulesByDay: ClassSchedulesByDay
// ): Array<{ id: string; name: string }> => {
//   const subjectsMap = new Map<string, string>();

//   Object.values(schedulesByDay).forEach((schedules) => {
//     if (!Array.isArray(schedules)) return;

//     schedules.forEach((schedule) => {
//       const subject = schedule.enrollment?.subject;
//       if (subject?.id && subject?.name) {
//         subjectsMap.set(subject.id.toString(), subject.name);
//       }
//     });
//   });

//   return Array.from(subjectsMap.entries()).map(([id, name]) => ({ id, name }));
// };

// export const extractUniqueTeachers = (
//   schedulesByDay: ClassSchedulesByDay
// ): Array<{ id: string; name: string }> => {
//   const teachersMap = new Map<string, string>();

//   Object.values(schedulesByDay).forEach((schedules) => {
//     if (!Array.isArray(schedules)) return;

//     schedules.forEach((schedule) => {
//       const tutor = schedule.enrollment?.tutor;
//       if (tutor?.id && tutor?.name) {
//         teachersMap.set(tutor.id.toString(), tutor.name);
//       }
//     });
//   });

//   return Array.from(teachersMap.entries()).map(([id, name]) => ({ id, name }));
// };

// export const extractUniqueStudents = (
//   schedulesByDay: ClassSchedulesByDay
// ): Array<{ id: string; name: string }> => {
//   const studentsMap = new Map<string, string>();

//   Object.values(schedulesByDay).forEach((schedules) => {
//     if (!Array.isArray(schedules)) return;

//     schedules.forEach((schedule) => {
//       const studentsGroups = schedule.enrollment?.studentsGroups;
//       if (Array.isArray(studentsGroups)) {
//         studentsGroups.forEach((sg) => {
//           if (sg.user?.id && sg.user?.name) {
//             studentsMap.set(sg.user.id.toString(), sg.user.name);
//           }
//         });
//       }
//     });
//   });

//   return Array.from(studentsMap.entries()).map(([id, name]) => ({ id, name }));
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// export default function SessionsChart({
//   inLineStyles,
// }: SessionsChartProps): JSX.Element {
//   const chartId = useId();
//   const { token } = useAppSelector((state) => state?.user);
//   const [modalOpen, setModalOpen] = useState<boolean>(false);
//   const [dateFilter, setDateFilter] = useState<[string, string]>([
//     moment().startOf("month").format("YYYY-MM-DD"),
//     moment().endOf("month").format("YYYY-MM-DD"),
//   ]);

//   // Filter states
//   const [activeFilter, setActiveFilter] = useState<FilterType>(null);
//   const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
//   const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
//   const [selectedCurriculums, setSelectedCurriculums] = useState<string[]>([]);
//   const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
//   const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
//   const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

//   const chartConfig = useMemo(() => chartConfigData, []);

//   // Modal handlers
//   const handleModal = useCallback(() => setModalOpen(true), []);
//   const handleClose = useCallback(() => {
//     setModalOpen(false);
//     setActiveFilter(null);
//     setSelectedBoards([]);
//     setSelectedGrades([]);
//     setSelectedCurriculums([]);
//     setSelectedSubjects([]);
//     setSelectedStudents([]);
//     setSelectedTeachers([]);
//   }, []);

//   // Filter change handlers
//   const handleFilterChange = useCallback((filter: FilterType) => {
//     setActiveFilter(filter);
//   }, []);

//   const handleBoardsChange = useCallback((boards: string[]) => {
//     setSelectedBoards(boards);
//   }, []);

//   const handleGradesChange = useCallback((grades: string[]) => {
//     setSelectedGrades(grades);
//   }, []);

//   const handleCurriculumsChange = useCallback((curriculums: string[]) => {
//     setSelectedCurriculums(curriculums);
//   }, []);

//   const handleSubjectsChange = useCallback((subjects: string[]) => {
//     setSelectedSubjects(subjects);
//   }, []);

//   const handleStudentsChange = useCallback((students: string[]) => {
//     setSelectedStudents(students);
//   }, []);

//   const handleTeachersChange = useCallback((teachers: string[]) => {
//     setSelectedTeachers(teachers);
//   }, []);

//   // Fetch class schedules grouped by day (same as class-calendar.tsx)
//   const {
//     data: schedulesData,
//     isLoading: schedulesLoading,
//     error: schedulesError,
//     refetch: refetchClassSchedulesData,
//   } = useQuery({
//     queryKey: ["class-schedules-groupedByDay"],
//     queryFn: () => getAllClassSchedules({}, { token }),
//     enabled: !!token,
//     refetchOnWindowFocus: false,
//     staleTime: 12000,
//   });

//   // Fetch reschedule requests (extra slots) - same as class-calendar.tsx
//   const {
//     data: rescheduleRequestData,
//     isLoading: isRescheduleRequestLoading,
//     refetch: refetchRescheduleRequestData,
//   } = useQuery({
//     queryKey: ["reschedule-requests", dateFilter],
//     queryFn: () =>
//       rescheduleRequest(
//         {
//           startDate: moment(dateFilter[0]).format("YYYY-MM-DD") || "",
//           endDate:
//             moment(dateFilter[1]).add(1, "day").format("YYYY-MM-DD") || "",
//         },
//         { token },
//         {}
//       ),
//     enabled: !!token,
//     refetchOnWindowFocus: false,
//     staleTime: 12000,
//   });

//   // Get raw data from API response
//   const rawSchedulesData = useMemo(() => {
//     return schedulesData?.data || schedulesData || null;
//   }, [schedulesData]);

//   // Convert to calendar events (same logic as class-calendar.tsx)
//   const calendarEvents = useMemo(() => {
//     return convertToCalendarEvents(
//       rawSchedulesData,
//       rescheduleRequestData || null,
//       dateFilter
//     );
//   }, [rawSchedulesData, rescheduleRequestData, dateFilter]);

//   // Apply filters to events
//   const filteredEvents = useMemo(() => {
//     const hasFilters =
//       selectedBoards.length > 0 ||
//       selectedGrades.length > 0 ||
//       selectedCurriculums.length > 0 ||
//       selectedSubjects.length > 0 ||
//       selectedStudents.length > 0 ||
//       selectedTeachers.length > 0;

//     if (!hasFilters) {
//       return calendarEvents;
//     }

//     return calendarEvents.filter((event) => {
//       const enrollment = event.slotData?.enrollment;
//       if (!enrollment) return false;

//       if (selectedBoards.length > 0) {
//         const boardId = enrollment.board?.id?.toString();
//         if (!boardId || !selectedBoards.includes(boardId)) return false;
//       }

//       if (selectedGrades.length > 0) {
//         const gradeId = enrollment.grade?.id?.toString();
//         if (!gradeId || !selectedGrades.includes(gradeId)) return false;
//       }

//       if (selectedCurriculums.length > 0) {
//         const curriculumId = enrollment.curriculum?.id?.toString();
//         if (!curriculumId || !selectedCurriculums.includes(curriculumId))
//           return false;
//       }

//       if (selectedSubjects.length > 0) {
//         const subjectId = enrollment.subject?.id?.toString();
//         if (!subjectId || !selectedSubjects.includes(subjectId)) return false;
//       }

//       if (selectedTeachers.length > 0) {
//         const tutorId = enrollment.tutor?.id?.toString();
//         if (!tutorId || !selectedTeachers.includes(tutorId)) return false;
//       }

//       if (selectedStudents.length > 0) {
//         // Check both studentsGroups (normal slots) and students (extra slots)
//         const studentGroupIds = enrollment.studentsGroups?.map((sg: any) =>
//           sg.user?.id?.toString()
//         );
//         const studentIds = enrollment.students?.map((s: any) =>
//           s.id?.toString()
//         );
//         const allStudentIds = [
//           ...(studentGroupIds || []),
//           ...(studentIds || []),
//         ].filter(Boolean);

//         if (
//           allStudentIds.length === 0 ||
//           !allStudentIds.some((id) => selectedStudents.includes(id))
//         ) {
//           return false;
//         }
//       }

//       return true;
//     });
//   }, [
//     calendarEvents,
//     selectedBoards,
//     selectedGrades,
//     selectedCurriculums,
//     selectedSubjects,
//     selectedStudents,
//     selectedTeachers,
//   ]);

//   // Process events into chart data
//   const filteredChartData = useMemo(() => {
//     return processCalendarEventsToChartData(filteredEvents);
//   }, [filteredEvents]);

//   // Current week label for subtitle
//   const currentWeekLabel = useMemo(() => {
//     const startOfWeek = moment().startOf("week");
//     const endOfWeek = moment().endOf("week");
//     return `${startOfWeek.format("MMM D")} - ${endOfWeek.format(
//       "MMM D, YYYY"
//     )}`;
//   }, []);

//   // Y-axis calculations
//   const yAxisMax = useMemo(
//     () => calculateYAxisMax(filteredChartData, activeFilter),
//     [filteredChartData, activeFilter]
//   );

//   const yAxisTicks = useMemo(() => generateYAxisTicks(yAxisMax), [yAxisMax]);

//   // Totals for summary
//   const totals = useMemo(
//     () => calculateTotals(filteredChartData),
//     [filteredChartData]
//   );

//   // X-axis ticks
//   const xAxisTicks = useMemo(
//     () => getXAxisTicks(filteredChartData),
//     [filteredChartData]
//   );

//   // Format X-axis
//   const formatXAxis = useCallback((dayIndex: number): string => {
//     return formatDayIndex(dayIndex);
//   }, []);

//   // Determine which areas to show
//   const showArea = useCallback(
//     (key: string): boolean => {
//       if (activeFilter === null) return true;
//       return activeFilter === key;
//     },
//     [activeFilter]
//   );

//   // Custom tooltip component
//   const CustomTooltip = useCallback<React.FC<CustomTooltipProps>>(
//     ({ active, payload, chartConfig }) => {
//       if (!active || !payload?.length) return null;

//       const dataPoint = payload[0]?.payload;
//       const fullDayName = getFullDayName(dataPoint.dayName);

//       return (
//         <div className={classes.tooltip}>
//           <div className={classes.tooltipLabel}>{fullDayName}</div>
//           <div className={classes.tooltipContent}>
//             <div className={classes.tooltipItem}>
//               <span className={classes.tooltipName}>Total Schedules</span>
//               <span className={classes.tooltipValue}>
//                 {dataPoint.totalSchedules}
//               </span>
//             </div>
//             {payload?.map((item, index) => (
//               <div key={index} className={classes.tooltipItem}>
//                 <div
//                   className={classes.tooltipIndicator}
//                   style={{ backgroundColor: item.color }}
//                 />
//                 <span className={classes.tooltipName}>
//                   {chartConfig[item.dataKey]?.label || item.name}
//                 </span>
//                 <span className={classes.tooltipValue}>{item.value}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     },
//     []
//   );

//   // Render chart content
//   const renderContent = useCallback(() => {
//     if (schedulesLoading || isRescheduleRequestLoading) {
//       return <LoadingBox />;
//     }

//     if (schedulesError) {
//       return (
//         <ErrorBox
//           message={(schedulesError as any)?.message || "Something went wrong"}
//         />
//       );
//     }

//     return (
//       <div className={classes.chartWrapper}>
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart
//             data={filteredChartData}
//             margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
//           >
//             <defs>
//               {Object.entries(chartConfig).map(([key, config]) => (
//                 <linearGradient
//                   key={key}
//                   id={`gradient-${key}-${chartId}`}
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop
//                     offset="5%"
//                     stopColor={config.color}
//                     stopOpacity={0.4}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor={config.color}
//                     stopOpacity={0.05}
//                   />
//                 </linearGradient>
//               ))}
//             </defs>
//             <CartesianGrid
//               strokeDasharray="3 3"
//               vertical={false}
//               stroke="var(--grey-color1)"
//               className={classes.grid}
//             />
//             <XAxis
//               dataKey="dayIndex"
//               axisLine={false}
//               tickLine={false}
//               ticks={xAxisTicks}
//               tickFormatter={formatXAxis}
//               tick={{
//                 fontFamily: "var(--leagueSpartan-medium-500)",
//                 fontSize: "clamp(0.625rem, 0.6rem + 0.125vw, 0.75rem)",
//                 fill: "var(--text-grey)",
//               }}
//               className={classes.axis}
//             />
//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tick={{
//                 fontFamily: "var(--leagueSpartan-medium-500)",
//                 fontSize: "clamp(0.625rem, 0.6rem + 0.125vw, 0.75rem)",
//                 fill: "var(--text-grey)",
//               }}
//               width={40}
//               allowDecimals={false}
//               domain={[0, yAxisMax]}
//               ticks={yAxisTicks}
//               type="number"
//               className={classes.axis}
//             />
//             <Tooltip
//               content={<CustomTooltip chartConfig={chartConfig} />}
//               cursor={{
//                 stroke: "var(--text-grey)",
//                 strokeWidth: 1,
//                 strokeDasharray: "3 3",
//               }}
//             />
//             {/* On Break - Grey (matching calendar) */}
//             {showArea("onBreak") && (
//               <Area
//                 type="monotone"
//                 dataKey="onBreak"
//                 stroke={chartConfig.onBreak.textColor}
//                 strokeWidth={2}
//                 fillOpacity={1}
//                 fill={`url(#gradient-onBreak-${chartId})`}
//                 style={{ cursor: "pointer" }}
//               />
//             )}
//             {/* Cancelled - Red (matching calendar) */}
//             {showArea("cancelled") && (
//               <Area
//                 type="monotone"
//                 dataKey="cancelled"
//                 stroke={chartConfig.cancelled.textColor}
//                 strokeWidth={2}
//                 fillOpacity={1}
//                 fill={`url(#gradient-cancelled-${chartId})`}
//                 style={{ cursor: "pointer" }}
//               />
//             )}
//             {/* Scheduled - Green (matching calendar) */}
//             {showArea("scheduled") && (
//               <Area
//                 type="monotone"
//                 dataKey="scheduled"
//                 stroke={chartConfig.scheduled.textColor}
//                 strokeWidth={2}
//                 fillOpacity={1}
//                 fill={`url(#gradient-scheduled-${chartId})`}
//                 style={{ cursor: "pointer" }}
//               />
//             )}
//             {/* Active - Blue (matching calendar) */}
//             {showArea("active") && (
//               <Area
//                 type="monotone"
//                 dataKey="active"
//                 stroke={chartConfig.active.textColor}
//                 strokeWidth={2}
//                 fillOpacity={1}
//                 fill={`url(#gradient-active-${chartId})`}
//                 style={{ cursor: "pointer" }}
//               />
//             )}
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     );
//   }, [
//     schedulesLoading,
//     isRescheduleRequestLoading,
//     schedulesError,
//     filteredChartData,
//     chartConfig,
//     chartId,
//     xAxisTicks,
//     formatXAxis,
//     yAxisMax,
//     yAxisTicks,
//     CustomTooltip,
//     showArea,
//   ]);

//   return (
//     <>
//       <ChartContainer
//         title="Schedules"
//         subtitle={currentWeekLabel}
//         inLineStyles={inLineStyles}
//         icon={true}
//         handleModal={handleModal}
//       >
//         {renderContent()}
//       </ChartContainer>

//       {/* {modalOpen && (
//         <SessionChartModal
//           open={modalOpen}
//           onClose={handleClose}
//           chartData={filteredChartData}
//           chartConfig={chartConfig}
//           totals={totals}
//           activeFilter={activeFilter}
//           onFilterChange={handleFilterChange}
//           selectedBoards={selectedBoards}
//           onBoardsChange={handleBoardsChange}
//           selectedGrades={selectedGrades}
//           onGradesChange={handleGradesChange}
//           selectedCurriculums={selectedCurriculums}
//           onCurriculumsChange={handleCurriculumsChange}
//           selectedSubjects={selectedSubjects}
//           onSubjectsChange={handleSubjectsChange}
//           selectedStudents={selectedStudents}
//           onStudentsChange={handleStudentsChange}
//           selectedTeachers={selectedTeachers}
//           onTeachersChange={handleTeachersChange}
//         />
//       )} */}
//     </>
//   );
// }
