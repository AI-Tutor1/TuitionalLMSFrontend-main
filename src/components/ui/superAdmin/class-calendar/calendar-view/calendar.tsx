import React, { FC, memo, useCallback, useState } from "react";
import moment, { Moment } from "moment";
import styles from "./calendar.module.css";
import { useMediaQuery } from "react-responsive";
import { useParams } from "next/navigation";

// ==================== TYPES ====================
interface TeacherSchedule {
  start_time: string;
  session_duration: number;
}

interface Enrollment {
  id: number;
  on_break?: boolean;
  subject?: {
    name: string;
  };
  tutor?: {
    name: string;
    profileImageUrl: string;
  };
  students?: {
    name: string;
    profileImageUrl: string;
  }[];
}

interface SlotData {
  id: number;
  class_status?: "CANCELLED" | "SCHEDULED" | "OTHER_STATUS";
  enrollment?: Enrollment;
  teacherSchedule?: TeacherSchedule;
  DateTime?: string;
  duration?: number;
}

interface Event {
  id: number;
  slotData: SlotData;
  title?: string;
  status?: "CANCELLED" | "SCHEDULED" | boolean;
  start: Date;
  end: Date;
  duration?: number;
}

interface HandleNormalSlotProps {
  open: boolean;
  day: string;
  startTime: string;
  endTime: string;
  ids: number[];
  enrollment_id: number | null;
}

interface CustomCalendarProps {
  events: Event[];
  handleCancelledScheduledSlot?: (data: { id: number; open: boolean }) => void;
  handleNormalSlot?: (data: HandleNormalSlotProps) => void;
  defaultView?: "MONTH" | "WEEK" | "DAY";
  role?: string;
}

type ViewType = "MONTH" | "WEEK" | "DAY";

// ==================== UTILITY FUNCTIONS ====================

const formatEventTime = (
  startTime: string | undefined,
  dateTime: string | undefined,
): string => {
  if (startTime) {
    return moment.utc(startTime, "HH:mm:ss").local().format("h:mm a");
  } else if (dateTime) {
    return moment.utc(dateTime).local().format("h:mm a");
  }
  return "";
};

const getEventStyles = (event: Event) => {
  const isInactive =
    event?.status === "CANCELLED" ||
    event?.slotData?.class_status === "CANCELLED";
  const isScheduled =
    event?.status === "SCHEDULED" ||
    event?.slotData?.class_status === "SCHEDULED";
  const isOnBreak = event?.slotData?.enrollment?.on_break === true;

  const backgroundColor = isOnBreak
    ? "var(--grey-color1)"
    : isInactive
      ? "var(--red-background-color1)"
      : isScheduled
        ? "var(--green-background-color5)"
        : "var(--light-blue)";

  const borderColor = isOnBreak
    ? "var(--text-grey)"
    : isInactive
      ? "var(--red-color)"
      : isScheduled
        ? "var(--green-text-color2)"
        : "var(--main-blue-color)";

  const textColor = borderColor;

  return { backgroundColor, borderColor, textColor };
};

// ==================== EVENT COMPONENT ====================
interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  isCompact?: boolean;
  index?: number;
  tab?: string;
}

// ==================== TOOLBAR COMPONENT ====================
interface ToolbarProps {
  currentDate: Moment;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const Toolbar: FC<ToolbarProps> = memo(
  ({ currentDate, view, onViewChange, onNavigate }) => {
    const getTitle = () => {
      switch (view) {
        case "MONTH":
          return currentDate.format("MMMM YYYY");
        case "WEEK":
          const weekStart = currentDate.clone().startOf("week");
          const weekEnd = currentDate.clone().endOf("week");
          if (weekStart.month() === weekEnd.month()) {
            return `${weekStart.format("MMM D")} - ${weekEnd.format(
              "D, YYYY",
            )}`;
          } else if (weekStart.year() === weekEnd.year()) {
            return `${weekStart.format("MMM D")} - ${weekEnd.format(
              "MMM D, YYYY",
            )}`;
          } else {
            return `${weekStart.format("MMM D, YYYY")} - ${weekEnd.format(
              "MMM D, YYYY",
            )}`;
          }
        case "DAY":
          return currentDate.format("dddd, MMMM D, YYYY");
        default:
          return "";
      }
    };

    return (
      <div className={styles.toolbar}>
        <div className={styles.toolbarNav}>
          <button
            className={styles.navButton}
            onClick={() => onNavigate("TODAY")}
          >
            Today
          </button>
          <button
            className={styles.navButton}
            onClick={() => onNavigate("PREV")}
          >
            ‹
          </button>
          <button
            className={styles.navButton}
            onClick={() => onNavigate("NEXT")}
          >
            ›
          </button>
        </div>

        <h2 className={styles.toolbarTitle}>{getTitle()}</h2>

        <div className={styles.viewButtons}>
          <button
            className={`${styles.viewButton} ${
              view === "MONTH" ? styles.active : ""
            }`}
            onClick={() => onViewChange("MONTH")}
          >
            Month
          </button>
          <button
            className={`${styles.viewButton} ${
              view === "WEEK" ? styles.active : ""
            }`}
            onClick={() => onViewChange("WEEK")}
          >
            Week
          </button>
          <button
            className={`${styles.viewButton} ${
              view === "DAY" ? styles.active : ""
            }`}
            onClick={() => onViewChange("DAY")}
          >
            Day
          </button>
        </div>
      </div>
    );
  },
);

Toolbar.displayName = "Toolbar";

// ==================== MONTH VIEW COMPONENT ====================
interface MonthViewProps {
  currentDate: Moment;
  events: Event[];
  onEventClick: (event: Event) => void;
  onMoreEventsClick: (date: Moment) => void;
  role?: string;
}

// ==================== MONTH VIEW COMPONENT ====================
interface MonthViewProps {
  currentDate: Moment;
  events: Event[];
  onEventClick: (event: Event) => void;
  onMoreEventsClick: (date: Moment) => void;
  role?: string;
}
// ==================== MONTH VIEW COMPONENT ====================
const MonthView: FC<MonthViewProps> = memo(
  ({ currentDate, events, onMoreEventsClick, role }) => {
    const smallMobileViewport = useMediaQuery({ minWidth: 400, maxWidth: 480 });

    const monthStart = currentDate.clone().startOf("month");
    const monthEnd = currentDate.clone().endOf("month");
    const startDate = monthStart.clone().startOf("week");
    const endDate = monthEnd.clone().endOf("week");

    const getDaysInMonth = () => {
      const days = [];
      const date = startDate.clone();

      while (date.isSameOrBefore(endDate, "day")) {
        days.push(date.clone());
        date.add(1, "day");
      }

      return days;
    };

    const getEventsForDay = (day: Moment) => {
      return events.filter((event) => {
        const eventDate = moment(event.start);
        return eventDate.isSame(day, "day");
      });
    };

    const days = getDaysInMonth();
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className={styles.monthView}>
        <div className={styles.monthlyWeekHeader}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.monthGrid}>
          {weeks?.map((week, weekIndex) => (
            <div key={weekIndex} className={styles.weekRow}>
              {week.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                const isToday = day.isSame(moment(), "day");
                const isCurrentMonth = day.isSame(currentDate, "month");

                return (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoreEventsClick(day);
                    }}
                    key={dayIndex}
                    className={`${styles.dayCell} ${
                      isToday ? styles.today : ""
                    } ${!isCurrentMonth ? styles.otherMonth : ""}`}
                  >
                    <div className={styles.dayNumber}>{day.date()}</div>
                    <div className={styles.dayEvents}>
                      {dayEvents.slice(0, 2).map((event, idx) => {
                        const { backgroundColor, borderColor, textColor } =
                          getEventStyles(event);

                        const formattedTime = formatEventTime(
                          event?.slotData?.teacherSchedule?.start_time,
                          event?.slotData?.DateTime,
                        );

                        const sessionDuration =
                          event?.slotData?.teacherSchedule?.session_duration ||
                          event?.slotData?.duration ||
                          0;
                        const subjectName =
                          event?.slotData?.enrollment?.subject?.name || "N/A";
                        const title = event?.title ?? "No Show";

                        return (
                          <div
                            key={event.id}
                            style={{
                              position: "absolute",
                              top: `${15 + idx * 10}px`,
                              left: `2px`,
                              zIndex: 10 + idx,
                              backgroundColor: backgroundColor,
                              borderLeft: `3px solid ${borderColor}`,
                              padding: "2.5px 5px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              boxShadow: "var(--cards-boxShadow-color)",
                              overflow: "hidden",
                              transition:
                                "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              gap: "2px",
                              width: "100px",
                              height: "25px",
                              opacity: 0.9,
                              fontSize: "var(--regular16-)",
                              color: "var(--pure-black-color)",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoreEventsClick(day);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "scale(1) translateY(-5px) translateX(-2.5px)";
                              e.currentTarget.style.boxShadow =
                                "0 10px 20px rgba(0, 0, 0, 0.15)";
                              e.currentTarget.style.zIndex = "1000";
                              e.currentTarget.style.overflow = "visible";
                              e.currentTarget.style.width = "max-content";
                              e.currentTarget.style.height = "max-content";
                              e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform =
                                "scale(1) translateY(0) translateX(0)";
                              e.currentTarget.style.boxShadow =
                                "var(--cards-boxShadow-color)";
                              e.currentTarget.style.zIndex = `${10 + idx}`;
                              e.currentTarget.style.overflow = "hidden";
                              e.currentTarget.style.width = "100px";
                              e.currentTarget.style.height = "25px";
                              e.currentTarget.style.opacity = "0.9";
                            }}
                          >
                            {role !== "student" && (
                              <p
                                className={styles.textFields}
                                style={{
                                  margin: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {title}
                              </p>
                            )}
                            <div className={styles.wrapper}>
                              {[
                                "superAdmin",
                                "admin",
                                "hr",
                                "counsellor",
                              ].includes(role as string) && (
                                <span>
                                  {event?.slotData?.enrollment?.id || ""}
                                </span>
                              )}
                              {role !== "teacher" && (
                                <p
                                  className={styles.textFields}
                                  style={{
                                    margin: 0,

                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {subjectName}
                                </p>
                              )}
                            </div>
                            <div className={styles.timeBox}>
                              <p
                                style={{
                                  margin: "0px",
                                }}
                              >
                                {formattedTime}
                              </p>
                              {(() => {
                                return [
                                  "superAdmin",
                                  "admin",
                                  "hr",
                                  "counsellor",
                                ].includes(role as string);
                              })() &&
                                sessionDuration > 0 && (
                                  <p
                                    style={{
                                      fontFamily:
                                        "var(--leagueSpartan-regular-400)",
                                      color: textColor,
                                      margin: "0px",
                                      fontSize: smallMobileViewport
                                        ? "9px"
                                        : "10px",
                                      lineHeight: smallMobileViewport
                                        ? "9px"
                                        : "10px",
                                    }}
                                  >
                                    {sessionDuration} m
                                  </p>
                                )}
                            </div>
                          </div>
                        );
                      })}
                      {dayEvents.length >= 3 && (
                        <div
                          className={styles.moreEvents}
                          style={{
                            position: "absolute",
                            cursor: "pointer",
                            top: `${60}px`,
                            left: `${30}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoreEventsClick(day);
                          }}
                        >
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

MonthView.displayName = "MonthView";

// ==================== WEEK VIEW COMPONENT ====================
interface WeekViewProps {
  currentDate: Moment;
  events: Event[];
  onEventClick: (event: Event) => void;
  onMoreEventsClick: (date: Moment) => void;
  role?: string;
}
const WeekView: FC<WeekViewProps> = memo(
  ({ currentDate, events, onEventClick, onMoreEventsClick, role }) => {
    const mediumMobileViewport = useMediaQuery({
      minWidth: 480,
      maxWidth: 576,
    });
    const smallMobileViewport = useMediaQuery({ minWidth: 400, maxWidth: 480 });
    const weekStart = currentDate.clone().startOf("week");
    const weekDays = [] as any[];

    for (let i = 0; i < 7; i++) {
      weekDays.push(weekStart.clone().add(i, "days"));
    }

    // Create half-hour time slots
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      timeSlots.push({ hour, minute: 0 });
      timeSlots.push({ hour, minute: 30 });
    }

    const getSlotHeight = () => {
      return 17.5;
    };

    const slotHeight = getSlotHeight();

    const getEventsForDay = (day: Moment) => {
      return events.filter((event) => {
        const eventStart = moment(event.start);
        return eventStart.isSame(day, "day");
      });
    };

    const getEventPosition = (event: Event) => {
      const eventStart = moment(event.start);
      const sessionDuration =
        event?.slotData?.teacherSchedule?.session_duration ||
        event?.slotData?.duration ||
        event?.duration ||
        0;

      const startMinutesFromMidnight =
        eventStart.hour() * 60 + eventStart.minute();

      const minutesPerSlot = 30;
      const pixelsPerMinute = slotHeight / minutesPerSlot;

      const top = startMinutesFromMidnight * pixelsPerMinute;
      const height = sessionDuration * pixelsPerMinute;

      return { top, height };
    };

    const getEventColumnsForDay = (dayEvents: Event[]) => {
      const sortedEvents = [...dayEvents].sort((a, b) => {
        return moment(a.start).diff(moment(b.start));
      });

      const columns: Event[][] = [];

      sortedEvents.forEach((event) => {
        const eventStart = moment(event.start);
        const sessionDuration =
          event?.slotData?.teacherSchedule?.session_duration ||
          event?.slotData?.duration ||
          event?.duration ||
          60;
        const eventEnd = eventStart.clone().add(sessionDuration, "minutes");

        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          const lastEventInColumn = column[column.length - 1];
          const lastEventStart = moment(lastEventInColumn.start);
          const lastEventDuration =
            lastEventInColumn?.slotData?.teacherSchedule?.session_duration ||
            lastEventInColumn?.slotData?.duration ||
            lastEventInColumn?.duration ||
            60;
          const lastEventEnd = lastEventStart
            .clone()
            .add(lastEventDuration, "minutes");

          if (eventStart.isSameOrAfter(lastEventEnd)) {
            column.push(event);
            placed = true;
            break;
          }
        }

        if (!placed) {
          columns.push([event]);
        }
      });

      return columns;
    };

    return (
      <div className={styles.weekView}>
        <div className={styles.weekHeader}>
          <div className={styles.timeColumn}></div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={styles.dayColumn}
              style={{
                background: day.isSame(moment(), "day")
                  ? "var(--orange-background-color1)"
                  : "var(--main-white-color)",
              }}
            >
              <div className={`${styles.dayDate}`}>{day.format("Do")}</div>
              <div className={styles.dayName}>{day.format("ddd")}</div>
            </div>
          ))}
        </div>

        <div className={styles.weekBody}>
          {/* Time grid */}
          {timeSlots.map((slot, index) => (
            <div key={index} className={styles.timeRow}>
              <div className={styles.timeLabel}>
                {moment().hour(slot.hour).minute(slot.minute).format("h:mm A")}
              </div>
              {weekDays?.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={styles.timeSlot}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoreEventsClick(day);
                  }}
                />
              ))}
            </div>
          ))}

          {/* Events layer - positioned over the grid */}
          <div className={styles.weekEventsContainer}>
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              const eventColumns = getEventColumnsForDay(dayEvents);
              const totalColumns = eventColumns.length;
              const dayColumnWidth = `calc((100% - ${5}px) / 7)`;
              const dayColumnLeft = `calc(clamp(0.46875rem, 0.3679rem + 0.4747vw, 0.9375rem) + ${dayColumnWidth} * ${dayIndex})`;

              return (
                <div
                  key={dayIndex}
                  className={styles.dayEventsColumn}
                  style={{
                    left: dayColumnLeft,
                    width: dayColumnWidth,
                  }}
                >
                  {eventColumns.map((column, columnIndex) =>
                    column.map((event) => {
                      const { top, height } = getEventPosition(event);
                      const { backgroundColor, borderColor, textColor } =
                        getEventStyles(event);

                      const formattedTime = formatEventTime(
                        event?.slotData?.teacherSchedule?.start_time,
                        event?.slotData?.DateTime,
                      );

                      const sessionDuration =
                        event?.slotData?.teacherSchedule?.session_duration ||
                        event?.slotData?.duration ||
                        0;
                      const subjectName =
                        event?.slotData?.enrollment?.subject?.name || "N/A";
                      const title = event?.title ?? "No Show";

                      // Calculate width and left position for overlapping events
                      const eventWidth =
                        totalColumns > 1
                          ? `calc((95% - ${totalColumns * 5}px))`
                          : "calc(95%)";
                      const eventLeft = columnIndex * 5;

                      return (
                        <div
                          onClick={() => onEventClick(event)}
                          key={event.id}
                          style={{
                            position: "absolute",
                            top: `${top}px`,
                            left: eventLeft,
                            width: eventWidth,
                            height: `${height}px`,
                            minHeight: "20px",
                            zIndex: 10 + columnIndex,
                            backgroundColor: backgroundColor,
                            borderLeft: `3px solid ${borderColor}`,
                            paddingRight: "3px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                            overflow: "hidden",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                            justifyContent: "center",
                            pointerEvents: "auto",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "scale(1.02) translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "var(--cards-boxShadow-color)";
                            e.currentTarget.style.zIndex = "1000";
                            e.currentTarget.style.overflow = "visible";
                            e.currentTarget.style.height = "max-content";
                            e.currentTarget.style.width = "max-content";
                            e.currentTarget.style.minHeight = `${height}px`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform =
                              "scale(1) translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 1px 3px rgba(0, 0, 0, 0.08)";
                            e.currentTarget.style.zIndex = `${
                              10 + columnIndex
                            }`;
                            e.currentTarget.style.overflow = "hidden";
                            e.currentTarget.style.height = `${height}px`;
                            e.currentTarget.style.width = `${eventWidth}`;
                            e.currentTarget.style.minHeight = "20px";
                          }}
                        >
                          {role !== "student" && (
                            <p
                              className={styles.textFields}
                              style={{
                                margin: 0,
                                fontSize:
                                  "clamp(0.438rem, 0.388rem + 0.25vw, 0.688rem)",
                                lineHeight:
                                  "clamp(0.438rem, 0.388rem + 0.25vw, 0.688rem)",
                                fontFamily: "var(--leagueSpartan-medium-500)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {title}
                            </p>
                          )}
                          <div className={styles.wrapper}>
                            {!mediumMobileViewport &&
                              [
                                "superAdmin",
                                "admin",
                                "hr",
                                "counsellor",
                              ].includes(role as string) && (
                                <span
                                  style={{
                                    fontSize:
                                      "clamp(0.438rem, 0.388rem + 0.25vw, 0.688rem)",
                                    lineHeight:
                                      "clamp(0.438rem, 0.388rem + 0.25vw, 0.688rem)",
                                    alignSelf: "flex-end",
                                  }}
                                >
                                  {event?.slotData?.enrollment?.id || ""}
                                </span>
                              )}
                            {role !== "teacher" && (
                              <p
                                className={styles.textFields}
                                style={{
                                  margin: 0,
                                  fontSize:
                                    "clamp(0.438rem, 0.388rem + 0.25vw, 0.688rem)",
                                  lineHeight:
                                    "clamp(0.438rem, 0.388rem + 0.25vw, 0.688rem)",
                                  fontFamily:
                                    "var(--leagueSpartan-semiBold-600)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {subjectName}
                              </p>
                            )}
                            <div className={styles.timeBox}>
                              <p
                                style={{
                                  color: "var(--text-color)",
                                  margin: "0px",
                                  fontSize:
                                    "clamp(0.438rem, 0.388rem + 0.25vw, 0.688rem)",
                                  lineHeight:
                                    "clamp(0.438rem, 0.388rem + 0.25vw, 0.688rem)",
                                  fontFamily:
                                    "var(--leagueSpartan-regular-400)",
                                }}
                              >
                                {formattedTime}
                              </p>
                              {(() => {
                                return [
                                  "superAdmin",
                                  "admin",
                                  "hr",
                                  "counsellor",
                                ].includes(role as string);
                              })() &&
                                !mediumMobileViewport &&
                                sessionDuration > 0 && (
                                  <p
                                    style={{
                                      fontFamily:
                                        "var(--leagueSpartan-regular-400)",
                                      color: textColor,
                                      margin: "0px",
                                      fontSize: smallMobileViewport
                                        ? "9px"
                                        : "10px",
                                      lineHeight: smallMobileViewport
                                        ? "9px"
                                        : "10px",
                                    }}
                                  >
                                    {sessionDuration} m
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    }),
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

WeekView.displayName = "WeekView";

// ==================== DAY VIEW COMPONENT ====================
interface DayViewProps {
  currentDate: Moment;
  events: Event[];
  onEventClick: (event: Event) => void;
  role?: string;
}

const DayView: FC<DayViewProps> = memo(
  ({ currentDate, events, onEventClick, role }) => {
    const laptopViewport = useMediaQuery({ minWidth: 1024, maxWidth: 1440 });
    const tabletViewport = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
    const bigMobileViewport = useMediaQuery({ minWidth: 576, maxWidth: 768 });
    const mediumMobileViewport = useMediaQuery({
      minWidth: 480,
      maxWidth: 576,
    });
    const smallMobileViewport = useMediaQuery({ minWidth: 400, maxWidth: 480 });
    const getSlotHeight = () => {
      return 17.5;
    };

    const slotHeight = getSlotHeight();

    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      timeSlots.push({ hour, minute: 0 });
      timeSlots.push({ hour, minute: 30 });
    }

    const dayEvents = events.filter((event) => {
      const eventDate = moment(event.start);
      return eventDate.isSame(currentDate, "day");
    });

    const getEventPosition = (event: Event) => {
      const eventStart = moment(event.start);

      const sessionDuration =
        event?.slotData?.teacherSchedule?.session_duration ||
        event?.slotData?.duration ||
        event?.duration ||
        0;

      const startMinutesFromMidnight =
        eventStart.hour() * 60 + eventStart.minute();

      const minutesPerSlot = 30;
      const pixelsPerMinute = slotHeight / minutesPerSlot;

      const top = startMinutesFromMidnight * pixelsPerMinute;
      const height = sessionDuration * pixelsPerMinute;

      return { top, height };
    };

    const getEventColumns = () => {
      const sortedEvents = [...dayEvents].sort((a, b) => {
        return moment(a.start).diff(moment(b.start));
      });

      const columns: Event[][] = [];

      sortedEvents.forEach((event) => {
        const eventStart = moment(event.start);
        const sessionDuration =
          event?.slotData?.teacherSchedule?.session_duration ||
          event?.slotData?.duration ||
          event?.duration ||
          60;

        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          const lastEventInColumn = column[column.length - 1];
          const lastEventStart = moment(lastEventInColumn.start);
          const lastEventDuration =
            lastEventInColumn?.slotData?.teacherSchedule?.session_duration ||
            lastEventInColumn?.slotData?.duration ||
            lastEventInColumn?.duration ||
            60;
          const lastEventEnd = lastEventStart
            .clone()
            .add(lastEventDuration, "minutes");

          if (eventStart.isSameOrAfter(lastEventEnd)) {
            column.push(event);
            placed = true;
            break;
          }
        }

        if (!placed) {
          columns.push([event]);
        }
      });

      return columns;
    };

    const eventColumns = getEventColumns();
    const totalColumns = eventColumns.length;

    return (
      <div className={styles.dayView}>
        <div className={styles.dayHeader}>
          {/* <h3>{currentDate.format("dddd, MMMM D, YYYY")}</h3> */}
        </div>

        <div className={styles.dayBody} style={{ position: "relative" }}>
          {timeSlots.map((slot, index) => (
            <div key={index} className={styles.hourRow}>
              <div className={styles.hourLabel}>
                {moment().hour(slot.hour).minute(slot.minute).format("h:mm A")}
              </div>
              <div className={styles.hourEvents}></div>
            </div>
          ))}

          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${50}px`,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
            }}
          >
            {eventColumns.map((column, columnIndex) =>
              column.map((event) => {
                const { top, height } = getEventPosition(event);
                const { backgroundColor, borderColor, textColor } =
                  getEventStyles(event);

                const formattedTime = formatEventTime(
                  event?.slotData?.teacherSchedule?.start_time,
                  event?.slotData?.DateTime,
                );

                const sessionDuration =
                  event?.slotData?.teacherSchedule?.session_duration ||
                  event?.slotData?.duration ||
                  0;
                const subjectName =
                  event?.slotData?.enrollment?.subject?.name || "N/A";
                const title = event?.title ?? "No Show";

                const eventWidth =
                  totalColumns > 1
                    ? `calc(${95 / totalColumns}% + 5px)`
                    : "calc(100%)";
                const eventLeft =
                  totalColumns > 1
                    ? `calc(${(70 / totalColumns) * (columnIndex + 0.2)}%)`
                    : "1%";
                return (
                  <div
                    key={event.id}
                    style={{
                      position: "absolute",
                      top: `${top}px`,
                      left: eventLeft,
                      width: eventWidth,
                      height: `${height}px`,
                      minHeight: "20px",
                      pointerEvents: "auto",
                      zIndex: 10 + columnIndex,
                      backgroundColor: backgroundColor,
                      borderLeft: `3px solid ${borderColor}`,
                      borderRadius: "5px",
                      padding: "3px",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
                      overflow: "hidden",
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2.5px",
                      justifyContent: "center",
                    }}
                    onClick={() => onEventClick(event)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.02) translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "var(--cards-boxShadow-color)";
                      e.currentTarget.style.zIndex = "100";
                      e.currentTarget.style.overflow = "visible";
                      e.currentTarget.style.height = "max-content";
                      e.currentTarget.style.height = "max-content";
                      e.currentTarget.style.width = "max-content";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1) translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(0, 0, 0, 0.08)";
                      e.currentTarget.style.zIndex = `${10 + columnIndex}`;
                      e.currentTarget.style.overflow = "hidden";
                      e.currentTarget.style.height = `${height}px`;
                      e.currentTarget.style.width = `${eventWidth}`;
                    }}
                  >
                    <div className={styles.wrapper}>
                      {(() => {
                        return [
                          "superAdmin",
                          "admin",
                          "hr",
                          "counsellor",
                        ].includes(role as string);
                      })() && (
                        <span
                          style={{
                            fontSize: smallMobileViewport ? "9px" : "10px",
                            lineHeight: smallMobileViewport ? "9px" : "10px",
                            alignSelf: "flex-end",
                          }}
                        >
                          {event?.slotData?.enrollment?.id || ""}
                        </span>
                      )}
                      {role !== "teacher" && (
                        <p
                          className={styles.textFields}
                          style={{
                            margin: 0,
                            fontSize: smallMobileViewport ? "9px" : "12px",
                            lineHeight: smallMobileViewport ? "9px" : "11px",
                            fontFamily: "var(--leagueSpartan-semiBold-600)",
                          }}
                        >
                          {subjectName}
                        </p>
                      )}
                      <div className={styles.timeBox}>
                        <p
                          style={{
                            color: "var(--text-color)",
                            margin: "0px",
                            fontSize: smallMobileViewport ? "9px" : "10px",
                            lineHeight: smallMobileViewport ? "9px" : "10px",
                            fontFamily: "var(--leagueSpartan-regular-400)",
                          }}
                        >
                          {formattedTime}
                        </p>
                        {(() => {
                          return [
                            "superAdmin",
                            "admin",
                            "hr",
                            "counsellor",
                          ].includes(role as string);
                        })() &&
                          sessionDuration > 0 && (
                            <p
                              style={{
                                fontFamily: "var(--leagueSpartan-regular-400)",
                                color: textColor,
                                margin: "0px",
                                fontSize: smallMobileViewport ? "9px" : "10px",
                                lineHeight: smallMobileViewport
                                  ? "9px"
                                  : "10px",
                              }}
                            >
                              {sessionDuration} m
                            </p>
                          )}
                      </div>
                    </div>
                    {role !== "student" && (
                      <p
                        className={styles.textFields}
                        style={{
                          margin: 0,
                          fontSize: smallMobileViewport ? "9px" : "11px",
                          lineHeight: smallMobileViewport ? "9px" : "11px",
                          fontFamily: "var(--leagueSpartan-medium-500)",
                        }}
                      >
                        {title}
                      </p>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    );
  },
);

DayView.displayName = "DayView";

// ==================== MAIN CALENDAR COMPONENT ====================
const CustomCalendar: FC<CustomCalendarProps> = ({
  events,
  handleCancelledScheduledSlot,
  handleNormalSlot,
  defaultView = "WEEK",
  // role,
}) => {
  const { role } = useParams();
  const [currentDate, setCurrentDate] = useState(moment());
  const [view, setView] = useState<ViewType>(defaultView);

  const handleEventClick = useCallback(
    (event: Event) => {
      const isCancelledOrScheduled =
        event?.slotData?.class_status === "CANCELLED" ||
        event?.slotData?.class_status === "SCHEDULED";

      if (isCancelledOrScheduled && handleCancelledScheduledSlot) {
        handleCancelledScheduledSlot({
          id: event.id,
          open: true,
        });
      } else if (handleNormalSlot) {
        handleNormalSlot({
          open: true,
          day: moment(event.start).format("dddd"),
          startTime: moment(event.start).format("hh:mm A"),
          endTime: moment(event.end).format("hh:mm A"),
          ids: [event.id],
          enrollment_id: event?.slotData?.enrollment?.id ?? null,
        });
      }
    },
    [handleCancelledScheduledSlot, handleNormalSlot],
  );

  const handleMoreEventsClick = useCallback((date: Moment) => {
    setCurrentDate(date);
    setView("DAY");
  }, []);

  const handleNavigate = useCallback(
    (action: "PREV" | "NEXT" | "TODAY") => {
      switch (action) {
        case "TODAY":
          setCurrentDate(moment());
          break;
        case "PREV":
          setCurrentDate((prev) => {
            const newDate = prev.clone();
            switch (view) {
              case "MONTH":
                return newDate.subtract(1, "month");
              case "WEEK":
                return newDate.subtract(1, "week");
              case "DAY":
                return newDate.subtract(1, "day");
              default:
                return newDate;
            }
          });
          break;
        case "NEXT":
          setCurrentDate((prev) => {
            const newDate = prev.clone();
            switch (view) {
              case "MONTH":
                return newDate.add(1, "month");
              case "WEEK":
                return newDate.add(1, "week");
              case "DAY":
                return newDate.add(1, "day");
              default:
                return newDate;
            }
          });
          break;
      }
    },
    [view],
  );

  const handleViewChange = useCallback((newView: ViewType) => {
    setView(newView);
  }, []);

  return (
    <div className={styles.customCalendar}>
      <Toolbar
        currentDate={currentDate}
        view={view}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
      />

      <div className={styles.calendarBody}>
        {view === "MONTH" && (
          <MonthView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onMoreEventsClick={handleMoreEventsClick}
            role={role as string}
          />
        )}
        {view === "WEEK" && (
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onMoreEventsClick={handleMoreEventsClick}
            role={role as string}
          />
        )}
        {view === "DAY" && (
          <DayView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            role={role as string}
          />
        )}
      </div>
    </div>
  );
};

export default memo(CustomCalendar);
