import { memo, useMemo, useState, useCallback } from "react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import classes from "./mobileViewCard.module.css";
import PaginationComponent from "@/components/global/pagination/pagination";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { MinutesToHours } from "@/utils/helpers/convert-minutes-to-hours";
import {
  getConclusionTypeStyles,
  getTagTypeStyles,
} from "@/utils/helpers/sessionType-styles";
import { useParams } from "next/navigation";
import { Tooltip, Checkbox } from "@mui/material";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import { getTooltipStyles } from "@/components/global/tooltip/tooltip";
import EmergencyRecordingRoundedIcon from "@mui/icons-material/EmergencyRecordingRounded";
const DEFAULT_PROFILE_IMAGE = "/assets/images/demmyPic.png";

interface MobileViewCardProps {
  data: any[];
  currentPage: number;
  totalPages: number;
  totalSessions: number;
  rowsPerPage: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  handleDeleteModal?: any;
  handleReload?: any;
  handleReloadLoading?: boolean;
  inlineStyling?: any;
  sessionsMonthlyTagData?: {
    Conducted?: number;
    Cancelled?: number;
    TeacherAbsent?: number;
    StudentAbsent?: number;
    NoShow?: number;
    totalConductedHours?: number;
    totalConductedDuration?: number;
  };
  sessionsMonthlyTagDataLoading?: boolean;
  handleTeacherDurationUpdateModal?: (data: {
    session_id: number;
    tutor_class_time: number | string;
  }) => void;
}

interface StudentDisplayProps {
  item: any;
  classes: any;
}

const MobileViewCard: React.FC<MobileViewCardProps> = ({
  data,
  currentPage,
  totalPages,
  totalSessions,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDeleteModal,
  handleReload,
  handleReloadLoading,
  inlineStyling,
  sessionsMonthlyTagData,
  sessionsMonthlyTagDataLoading,
  handleTeacherDurationUpdateModal,
}) => {
  const router = useRouter();
  const params = useParams();
  const { role } = params;
  const [refreshId, setRefreshId] = useState<number | null>(null);

  const isAdminRole = useMemo(
    () =>
      role === "superAdmin" ||
      role === "admin" ||
      role === "manager" ||
      role === "counsellor" ||
      role === "hr",
    [role],
  );

  const handleRoute = useCallback(
    (id: number, event: React.MouseEvent) => {
      window.open(`/${role}/session-details/${id}`, "_blank");
    },
    [router, role],
  );

  const handleReloadClick = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      setRefreshId(id);
      handleReload?.(e, id);
    },
    [handleReload],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      setRefreshId(id);
      handleDeleteModal?.(e, id);
    },
    [handleDeleteModal],
  );

  const countItems = useMemo(
    () => [
      {
        label: "Conducted",
        count: sessionsMonthlyTagData?.Conducted,
        color: "var(--green-text-color4)",
        background: "var(--green-background-color4)",
      },
      {
        label: "Cancelled",
        count: sessionsMonthlyTagData?.Cancelled,
        color: "var(--red-text-color1)",
        background: "var(--red-background-color1)",
      },
      {
        label: "Teacher Absent",
        count: sessionsMonthlyTagData?.TeacherAbsent,
        color: "var(--purple-text-color1)",
        background: "var(--purple-background-color1)",
      },
      {
        label: "Student Absent",
        count: sessionsMonthlyTagData?.StudentAbsent,
        color: "var(--blue-text-color1)",
        background: "var(--blue-background-color1)",
      },
      {
        label: "No Show",
        count: sessionsMonthlyTagData?.NoShow,
        color: "var(--orange-text-color1)",
        background: "var(--orange-background-color1)",
      },
      {
        label: "Duration",
        count: sessionsMonthlyTagData?.totalConductedHours?.toFixed(2),
        color: "var(--green-text-color1)",
        background: "var(--green-background-color1)",
      },
      {
        label: "Student Duration",
        count: sessionsMonthlyTagData?.totalConductedDuration?.toFixed(2),
        color: "var(--green-text-color1)",
        background: "var(--green-background-color1)",
      },
    ],
    [sessionsMonthlyTagData],
  );
  return (
    <div className={classes.mobileViewContainer} style={inlineStyling}>
      <div className={classes.countBox}>
        {countItems?.map((item, index) => (
          <div
            key={index}
            className={classes.countItem}
            style={{ backgroundColor: item.background, color: item?.color }}
          >
            <div className={classes.countLabel}>
              {item.label}:{" "}
              {sessionsMonthlyTagDataLoading ? (
                <LoadingBox
                  inlineStyling={{
                    height: "max-content",
                    width: "max-content",
                  }}
                  loaderStyling={{
                    height: "var(--regular20-) !important",
                    width: "var(--regular20-) !important",
                    color: `${item?.color}`,
                  }}
                />
              ) : (
                <strong>{item.count || 0}</strong>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={classes.scrollBox}>
        {data?.map((item, index) => {
          const { created_at, id, tutor, subject } = item;

          return (
            <div
              className={classes.container}
              key={id || index}
              onClick={
                isAdminRole
                  ? (event) => handleRoute(item?.id, event)
                  : undefined
              }
            >
              <div className={classes.header}>
                {isAdminRole && (
                  <span className={classes.id}>Enroll_Id: {id}</span>
                )}
                <div className={classes.date}>
                  <span>
                    {moment.utc(created_at).local().format("Do-MMM-YYYY") ||
                      "No Show"}
                  </span>
                  <span>
                    {moment.utc(created_at).local().format("h:mm a") ||
                      "No Show"}
                  </span>
                </div>
              </div>
              <div className={classes.profileSection}>
                <div className={classes.section}>
                  <h4 className={classes.label}>Tutor</h4>
                  <div className={classes.profile}>
                    <div className={classes.imageBox}>
                      <Image
                        src={
                          tutor?.profileImageUrl ||
                          "/assets/images/demmyPic.png"
                        }
                        alt={tutor?.name ?? "Tutor"}
                        fill
                        sizes="50px"
                      />
                    </div>
                    <p className={classes.name}>
                      {tutor?.name
                        ?.trim()
                        ?.split(" ")
                        ?.slice(0, 3)
                        ?.join(" ") || "No Show"}
                    </p>
                  </div>
                </div>

                <div className={classes.section}>
                  <h4 className={classes.label}>Students</h4>
                  <div className={classes.studentsBox}>
                    <StudentDisplay item={item} classes={classes} />
                  </div>
                </div>
              </div>

              <div className={classes.row}>
                <div className={classes.field}>
                  <span className={classes.label}>Subject</span>
                  <span className={classes.value}>
                    {subject?.name || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Duration</span>
                  <span className={classes.value}>
                    {MinutesToHours(item?.duration) || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Student Duration</span>
                  <span className={classes.value}>
                    {item?.groupSessionTime && item?.groupSessionTime.length > 0
                      ? item.groupSessionTime.map(
                          (session: any, index: number) => (
                            <span key={index}>
                              {MinutesToHours(session.class_duration_time)}
                              {item.groupSessionTime.length > 1 &&
                                index === 0 && <span>,&nbsp;</span>}
                            </span>
                          ),
                        )
                      : "-"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Teacher Duration</span>
                  <span className={classes.value}>
                    {item?.conclusion_type === "No Show"
                      ? "No Show"
                      : MinutesToHours(item?.tutor_class_time) || "No Show"}
                    {isAdminRole && (
                      <>
                        &nbsp;
                        <Tooltip
                          title="Update Teacher Duration"
                          arrow
                          slotProps={getTooltipStyles()}
                        >
                          <span
                            className={classes.iconBox}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTeacherDurationUpdateModal?.({
                                session_id: item.id || 0,
                                tutor_class_time: item?.tutor_class_time
                                  ? MinutesToHours(item?.tutor_class_time)
                                  : "-",
                              });
                            }}
                          >
                            <UpgradeIcon
                              sx={{
                                color: "var(--pure-black-color)",
                                fontSize: "var(--regular20-)",
                              }}
                            />
                          </span>
                        </Tooltip>
                      </>
                    )}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Session Status</span>
                  <span
                    className={classes.value}
                    style={getConclusionTypeStyles(
                      item?.conclusion_type,
                      "var(--regular18-)",
                    )}
                  >
                    {item?.conclusion_type || "No Show"}
                  </span>
                </div>
              </div>
              {(role === "superAdmin" ||
                role === "admin" ||
                role === "counsellor" ||
                role === "hr") && (
                <div className={classes.iconsContainer}>
                  <span
                    style={{
                      ...getTagTypeStyles(item?.tag, "var(--regular20-)"),
                    }}
                  >
                    {item?.tag}
                  </span>
                  <div className={classes.actionsBox}>
                    <Checkbox
                      checked={item?.is_reviewed !== "Pending"}
                      sx={{
                        padding: "4px",
                        "& .MuiSvgIcon-root": {
                          fontSize: "var(--regular18-)",
                          borderRadius: "50%",
                        },
                        "&.Mui-checked": {
                          color:
                            item?.is_reviewed === "Admin"
                              ? "var(--main-blue-color)"
                              : item?.is_reviewed === "Manager"
                                ? "var(--main-blue-color)"
                                : item?.is_reviewed === "Both"
                                  ? "var(--green-text-color4)"
                                  : "var(--main-blue-color)",
                        },
                        "& .MuiCheckbox-root": {
                          borderRadius: "50%",
                        },
                      }}
                      icon={
                        <span
                          style={{
                            width: "var(--regular18-)",
                            height: "var(--regular18-)",
                            borderRadius: "50%",
                            border: "2px solid var(--black-color)",
                            display: "inline-block",
                          }}
                        />
                      }
                      checkedIcon={
                        <span
                          style={{
                            width: "var(--regular18-)",
                            height: "var(--regular18-)",
                            borderRadius: "50%",
                            border: `2px solid ${
                              item?.is_reviewed === "Admin"
                                ? "var(--main-blue-color)"
                                : item?.is_reviewed === "Manager"
                                  ? "var(--main-blue-color)"
                                  : item?.is_reviewed === "Both"
                                    ? "var(--green-text-color4)"
                                    : "var(--main-blue-color)"
                            }`,
                            backgroundColor:
                              item?.is_reviewed === "Admin"
                                ? "var(--main-blue-color)"
                                : item?.is_reviewed === "Manager"
                                  ? "var(--main-blue-color)"
                                  : item?.is_reviewed === "Both"
                                    ? "var(--green-text-color4)"
                                    : "var(--main-blue-color)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "var(--regular18-)",
                          }}
                        >
                          ✓
                        </span>
                      }
                    />
                    {isAdminRole && (
                      <>
                        {handleReloadLoading && refreshId === item?.id ? (
                          <LoadingBox
                            loaderStyling={{
                              width: "var(--regular14-) !important",
                              height: "var(--regular14-) !important",
                            }}
                          />
                        ) : (
                          <Tooltip
                            title="Reload Session"
                            slotProps={getTooltipStyles()}
                            arrow
                          >
                            <span
                              className={classes.iconBox}
                              onClick={(e) => handleReloadClick(e, item?.id)}
                            >
                              <Image
                                src="/assets/svgs/reload.svg"
                                alt="reload"
                                width={0}
                                height={0}
                                style={{
                                  width: "var(--regular18-)",
                                  height: "var(--regular18-)",
                                }}
                              />
                            </span>
                          </Tooltip>
                        )}
                        <Tooltip
                          title="Delete Session"
                          arrow
                          slotProps={getTooltipStyles()}
                        >
                          <span
                            className={classes.iconBox}
                            onClick={(e) => handleDeleteClick(e, item?.id)}
                          >
                            <Image
                              src="/assets/svgs/delete.svg"
                              alt="delete"
                              width={0}
                              height={0}
                              style={{
                                width: "var(--regular18-)",
                                height: "var(--regular18-)",
                              }}
                            />
                          </span>
                        </Tooltip>
                      </>
                    )}
                    {item?.meet_recording ? (
                      <Tooltip
                        title="Session Recording"
                        arrow
                        slotProps={getTooltipStyles()}
                      >
                        <span
                          className={classes.iconBox}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(
                              JSON.parse(item?.meet_recording)[0],
                              "_blank",
                            );
                          }}
                        >
                          <EmergencyRecordingRoundedIcon
                            sx={{
                              fontSize: "var(--regular18-)",
                              color: "var(--pure-black-color)",
                            }}
                          />
                        </span>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        totalEntries={totalSessions || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[15, 30, 50]}
        inlineStyles={{ padding: "10px", width: "100%" }}
      />
    </div>
  );
};

export default MobileViewCard;

const StudentDisplay = memo(({ item, classes }: StudentDisplayProps) => {
  const studentsGroups = item?.ClassSchedule?.enrollment?.studentsGroups ?? [];
  const students = item?.students ?? [];
  const isScheduledClass = !!item?.ClassSchedule;

  const studentsArray = isScheduledClass ? studentsGroups : students;

  if (!studentsArray.length) {
    return <span>No Show</span>;
  }

  const firstStudent = studentsArray[0];
  const firstStudentName = firstStudent?.user?.name?.trim() || "No Show";
  const firstStudentImage =
    firstStudent?.user?.profileImageUrl || DEFAULT_PROFILE_IMAGE;

  const hasSecondStudent = studentsArray.length > 1;
  const secondStudent = hasSecondStudent ? studentsArray[1] : null;
  const secondStudentImage =
    secondStudent?.user?.profileImageUrl || DEFAULT_PROFILE_IMAGE;
  const secondStudentName = secondStudent?.user?.name || "No Show";

  return (
    <div className={classes.studentsBox}>
      <div className={classes.imagesBox}>
        <span className={classes.imageBox}>
          <Image
            src={firstStudentImage}
            alt={firstStudentName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </span>

        {hasSecondStudent && (
          <span className={classes.imageBox}>
            <Image
              src={secondStudentImage}
              alt={secondStudentName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </span>
        )}
      </div>

      <p className={classes.studentName}>{firstStudentName}</p>

      {studentsArray.length > 2 && (
        <p className={classes.studentCount}>+{studentsArray.length - 2} more</p>
      )}
    </div>
  );
});

StudentDisplay.displayName = "StudentDisplay";
