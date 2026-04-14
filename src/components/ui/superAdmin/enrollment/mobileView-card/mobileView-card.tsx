import React, { useState, CSSProperties, useMemo } from "react";
import Image from "next/image";
import moment from "moment";
import classes from "./mobileView-card.module.css";
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
  const router = useRouter();
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
          const {
            createdAt,
            id,
            tutor,
            studentsGroups,
            subject,
            curriculum,
            board,
            grade,
            on_break,
            hourly_rate,
            tutor_hourly_rate,
            google_chat_space_id,
            name,
            is_permanent,
          } = item;

          return (
            <div
              className={classes.container}
              key={id || index}
              onClick={
                isRowClickable ? (event) => handleRoute(id, event) : undefined
              }
            >
              <div className={classes.header}>
                <span className={classes.id}>En_id: {id}</span>
                <span className={classes.date}>
                  {createdAt
                    ? moment.utc(createdAt).local().format("DD-MMM-YYYY")
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
                          tutor?.profileImageUrl ||
                          "/assets/images/dummyPic.png"
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
                    <div className={classes.imagesBox}>
                      {studentsGroups
                        ?.slice(0, 2)
                        .map((student: any, idx: number) => (
                          <div className={classes.imageBox} key={idx}>
                            <Image
                              src={
                                student?.user?.profileImageUrl ||
                                "/assets/images/dummyPic.png"
                              }
                              alt={student?.user?.name ?? "Student"}
                              fill
                              sizes="40px"
                            />
                          </div>
                        ))}
                    </div>
                    <p className={classes.name}>
                      {studentsGroups?.[0]?.user?.name
                        .trim()
                        .split(" ")
                        .slice(0, 2)
                        .join(" ") || "No Show"}
                      {studentsGroups?.[1] &&
                        `, ${studentsGroups[1].user.name
                          .trim()
                          .split(" ")
                          .slice(0, 2)
                          .join(" ")}`}
                      {studentsGroups?.length > 2 &&
                        ` +${studentsGroups.length - 2} more`}
                    </p>
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
                  <span className={classes.label}>Curriculum</span>
                  <span className={classes.value}>
                    {curriculum?.name || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Grade</span>
                  <span className={classes.value}>
                    {grade?.name || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Board</span>
                  <span className={classes.value}>
                    {board?.name || "No Show"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Session Rate</span>
                  <span className={classes.value}>
                    AED {getRate(item) || "No Show"}
                  </span>
                </div>
              </div>

              {(role === "superAdmin" ||
                role === "admin" ||
                role === "counsellor" ||
                role === "hr") && (
                <div className={classes.iconsContainer}>
                  <BasicSwitches
                    value={on_break}
                    handleToggle={
                      canToggleBreak
                        ? (e: any) =>
                            handleSwitch(e, {
                              id: id || null,
                              on_break: on_break,
                              name: name || "",
                              is_permanent: is_permanent,
                            })
                        : undefined
                    }
                  />
                  <div className={classes.actionsBox}>
                    <Tooltip
                      title="Copy Chat Link"
                      arrow
                      slotProps={getTooltipStyles()}
                    >
                      <span className={classes.iconBox}>
                        <ContentCopyIcon
                          sx={{
                            color: "var(--pure-black-color)",
                            fontSize: "var(--regular18-)",
                          }}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(
                              `https://mail.google.com/chat/u/0/#chat/space/${google_chat_space_id}` ||
                                ""
                            );
                            toast.success(
                              "Google chat link copied to clipboard!"
                            );
                          }}
                        />
                      </span>
                    </Tooltip>

                    <Tooltip
                      title={"Start an instant class"}
                      arrow
                      slotProps={getTooltipStyles()}
                    >
                      <span
                        className={classes.iconBox}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstantClassModal(e, item);
                        }}
                      >
                        <Image
                          src="/assets/svgs/setting.svg"
                          alt="instant class"
                          width={0}
                          height={0}
                          style={{
                            width: "var(--regular18-)",
                            height: "var(--regular18-)",
                          }}
                        />
                      </span>
                    </Tooltip>

                    <Tooltip
                      title={"Edit Enrollment"}
                      arrow
                      slotProps={getTooltipStyles()}
                    >
                      <span
                        className={classes.iconBox}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditModal(e, item);
                        }}
                      >
                        <Image
                          src="/assets/svgs/edit.svg"
                          alt="edit"
                          width={0}
                          height={0}
                          style={{
                            width: "var(--regular18-)",
                            height: "var(--regular18-)",
                          }}
                        />
                      </span>
                    </Tooltip>

                    <Tooltip
                      title={"Delete Enrollment"}
                      arrow
                      slotProps={getTooltipStyles()}
                    >
                      <span
                        className={classes.iconBox}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModal(e, id);
                        }}
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
                  </div>
                </div>
              )}
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
