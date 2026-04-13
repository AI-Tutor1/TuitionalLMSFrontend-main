import React, { CSSProperties, useMemo } from "react";
import Image from "next/image";
import moment from "moment";
import classes from "./mobile-view-card.module.css";
import BasicSwitches from "@/components/global/toggle-button/toggle-button";
import PaginationComponent from "@/components/global/pagination/pagination";
import { useParams } from "next/navigation";
import { Tooltip } from "@mui/material";
import { toast } from "react-toastify";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { useRouter } from "next/navigation";
import { ROLE_IDS } from "@/const/dashboard/role_ids_names";
import { getTooltipStyles } from "@/components/global/tooltip/tooltip";

interface MobileViewCardProps {
  data: any[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  handleDeleteModal?: any;
  handleEditModal?: any;
  handleInstantClassModal?: any;
  handleSwitch?: any;
  breakLoading?: boolean;
  canToggleBreak?: boolean;
  inlineStyling?: CSSProperties;
}

const MobileViewCard: React.FC<MobileViewCardProps> = ({
  data,
  currentPage,
  totalPages,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  handleDeleteModal,
  handleEditModal,
  handleInstantClassModal,
  breakLoading,
  handleSwitch,
  inlineStyling,
}) => {
  const params = useParams();
  const { role } = params;
  const { roleId } = useAppSelector((state) => state?.user?.user!);

  const isRowClickable = useMemo(
    () => role === "superAdmin" || role === "admin" || role === "counsellor",
    [role]
  );

  const canToggleBreak = useMemo(
    () => role === "superAdmin" || role === "admin" || role === "counsellor",
    [role]
  );

  const handleRoute = (id: number, event: React.MouseEvent) => {
    if (!isRowClickable) return;
    const targetPath = `/${role}/enrollment-details/${id}`;
    window.open(targetPath, "_blank");
  };

  const getRate = (item: any) => {
    if (roleId === ROLE_IDS.TEACHER) {
      return item.tutor_hourly_rate ?? "No Show";
    }
    return item.hourly_rate ?? "No Show";
  };

  return (
    <div className={classes.mobileViewContainer} style={inlineStyling}>
      <div className={classes.scrollBox}>
        {data?.map((item, index) => {
          const { createdAt, enrollment_reschedual, DateTime, user } = item;

          return (
            <div
              className={classes.container}
              key={enrollment_reschedual?.tid || index}
            >
              <div className={classes.header}>
                <span className={classes.id}>
                  En_id: {enrollment_reschedual?.id}
                </span>
                <span className={classes.date}>
                  {DateTime
                    ? moment.utc(DateTime).local().format("DD-MMM-YYYY")
                    : "N/A"}
                </span>
              </div>
              <div className={classes.profileSection}>
                <div className={classes.section}>
                  <h4 className={classes.label}>Tutor</h4>
                  <div className={classes.profile}>
                    <div className={classes.imageBox}>
                      <Image
                        src={
                          enrollment_reschedual?.tutor?.profileImageUrl ||
                          "/assets/images/demmyPic.png"
                        }
                        alt={enrollment_reschedual?.tutor?.name ?? "Tutor"}
                        fill
                        sizes="50px"
                      />
                    </div>
                    <p className={classes.name}>
                      {enrollment_reschedual?.tutor?.name
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
                    <div className={classes.imagesBox}>
                      {enrollment_reschedual?.studentsGroups
                        ?.slice(0, 2)
                        .map((student: any, idx: number) => (
                          <div className={classes.imageBox} key={idx}>
                            <Image
                              src={
                                student?.user?.profileImageUrl ||
                                "/assets/images/demmyPic.png"
                              }
                              alt={student?.user?.name ?? "Student"}
                              fill
                              sizes="40px"
                            />
                          </div>
                        ))}
                    </div>
                    <p className={classes.name}>
                      {enrollment_reschedual?.studentsGroups?.[0]?.user?.name
                        .trim()
                        .split(" ")
                        .slice(0, 2)
                        .join(" ") || "No Show"}
                      {enrollment_reschedual?.studentsGroups?.[1] &&
                        `, ${enrollment_reschedual.studentsGroups[1].user.name
                          .trim()
                          .split(" ")
                          .slice(0, 2)
                          .join(" ")}`}
                      {enrollment_reschedual?.studentsGroups?.length > 2 &&
                        ` +${
                          enrollment_reschedual.studentsGroups.length - 2
                        } more`}
                    </p>
                  </div>
                </div>
              </div>

              <div className={classes.row}>
                <div className={classes.field}>
                  <span className={classes.label}>Subject</span>
                  <span className={classes.value}>
                    {enrollment_reschedual?.subject?.name || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Curriculum</span>
                  <span className={classes.value}>
                    {enrollment_reschedual?.curriculum?.name || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Grade</span>
                  <span className={classes.value}>
                    {enrollment_reschedual?.grade?.name || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Board</span>
                  <span className={classes.value}>
                    {enrollment_reschedual?.board?.name || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Cancelled at</span>
                  <span className={classes.value}>
                    {createdAt
                      ? moment.utc(createdAt).local().format("DD-MMM-YYYY")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage || 0}
        rowsPerPage={rowsPerPage || 0}
        totalEntries={totalCount || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 100, 200, 300]}
        inlineStyles={{ padding: "10px", width: "100%" }}
      />
    </div>
  );
};

export default MobileViewCard;
