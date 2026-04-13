import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Tooltip } from "@mui/material";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import TurnRightIcon from "@mui/icons-material/TurnRight";
import moment from "moment";
import Button from "@/components/global/button/button";
import classes from "./churnCard.module.css";

interface ChurnCardProps {
  item: any;
  user: any;
  expandedFeedbacks: Set<number>;
  toggleFeedback: (id: number) => void;
  handleEditFeedbackModal: (feedback: any) => void;
  handleDeleteFeedbackModal: (id: number) => void;
  handleMoreFeedbackModal: (id: number) => void;
}

const ChurnCard: React.FC<ChurnCardProps> = ({
  item,
  user,
  expandedFeedbacks,
  toggleFeedback,
  handleEditFeedbackModal,
  handleDeleteFeedbackModal,
  handleMoreFeedbackModal,
}) => {
  const router = useRouter();
  const { role } = useParams();

  const parseEnrollmentName = useMemo(
    () => (name: string) => {
      const parts = name.split(" | ").map((part) => part.trim());
      const studentAndTutor = parts[0]?.split("/").map((part) => part.trim());
      return {
        studentName: studentAndTutor?.[0] || "N/A",
        tutorName: studentAndTutor?.[1]?.replace(" -", "").trim() || "N/A",
        curriculum: parts[1] || "N/A",
        board: parts[2] || "N/A",
        grade: parts[3] || "N/A",
        subject: parts[4] || "N/A",
      };
    },
    [],
  );

  const enrollmentInfo = useMemo(
    () => parseEnrollmentName(item?.enrollment?.name),
    [item?.enrollment?.name],
  );
  const churnId = useMemo(() => item?.id, [item?.id]);

  const getRoleColor = useMemo(
    () => (roleId: number) => {
      const colorMap: Record<number, { color: string; bg: string }> = {
        1: { color: "#653838", bg: "#FFACAC" },
        2: { color: "#653838", bg: "#FFACAC" },
        3: { color: "#286320", bg: "#96EFCF" },
        4: { color: "#2D2D2D", bg: "#FFFAA0" },
        5: { color: "#2F3282", bg: "#DBDCFF" },
      };
      return colorMap[roleId] || { color: "#653838", bg: "#FFACAC" };
    },
    [],
  );

  const calculateLifeSpan = useCallback(() => {
    const duration = moment.duration(
      moment(item.churned_at).diff(moment(item?.enrollment?.createdAt)),
    );
    return `${duration.days()} days`;
  }, [item.churned_at, item?.enrollment?.createdAt]);

  return (
    <div key={item.id} className={classes.churnItem}>
      <div className={classes.enrollmentInfo}>
        <p className={classes.enrollmentInfoField}>
          Student: <span>{enrollmentInfo.studentName}</span>
        </p>
        <p className={classes.enrollmentInfoField}>
          Tutor: <span>{enrollmentInfo.tutorName}</span>
        </p>
        <p className={classes.enrollmentInfoField}>
          Subject: <span>{enrollmentInfo.subject}</span>
        </p>
        <p className={classes.enrollmentInfoField}>
          Curriculum: <span>{enrollmentInfo.curriculum}</span>
        </p>
        <p className={classes.enrollmentInfoField}>
          Board: <span>{enrollmentInfo.board}</span>
        </p>
        <p className={classes.enrollmentInfoField}>
          Grade: <span>{enrollmentInfo.grade}</span>
        </p>
        <p className={classes.enrollmentInfoField}>
          Priority: <span>{item?.enrollment?.priority || "No Show"}</span>
        </p>
        <p className={classes.enrollmentInfoField}>
          Lead Gn: <span>{item?.enrollment?.lead_generator || "No Show"}</span>
        </p>
      </div>

      <div className={classes.feedbackBox}>
        {item?.feedbacks?.length > 0 && (
          <div className={classes.mainBox}>
            <div className={classes.feedbacksHighlight}>
              <p className={classes.churnInfoBox}>
                Id: <span>{item.id}</span>
              </p>
              <p className={classes.churnInfoBox}>
                Churned At:
                <span> {moment.utc(item.churned_at).format("Do-MMM-YY")}</span>
              </p>
              <p className={classes.churnInfoBox}>
                Life Span: <span>{calculateLifeSpan()}</span>
              </p>
            </div>

            {item?.feedbacks?.map((feedback: any) => {
              const isExpanded = expandedFeedbacks.has(feedback?.id);
              const roleColors = getRoleColor(feedback?.user?.roleId);

              return (
                <div key={feedback?.id} className={classes.feedback}>
                  <div
                    className={`${classes.feedbackHeader} ${
                      isExpanded ? classes.expand : ""
                    }`}
                    onClick={() => toggleFeedback(feedback.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <p className={classes.enrollmentInfoFieldFeedBy}>
                      Feedback By:{" "}
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "max-content",
                          padding: "2.5px 5px",
                          borderRadius: "5px",
                          color: roleColors.color,
                          backgroundColor: roleColors.bg,
                        }}
                      >
                        {feedback?.user?.name?.split(" ").slice(0, 2).join(" ")}
                      </span>
                    </p>
                    <div className={classes.feebBackActions}>
                      <Tooltip title="Edit Feedback" arrow>
                        <span
                          className={classes.iconBox}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFeedbackModal(feedback);
                          }}
                        >
                          <Image
                            src="/assets/svgs/edit.svg"
                            alt="edit"
                            width={0}
                            height={0}
                            style={{
                              width:
                                "clamp(0.5rem, 0.419rem + 0.38vw, 0.875rem)",
                              height:
                                "clamp(0.5rem, 0.419rem + 0.38vw, 0.875rem)",
                            }}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete Feedback" arrow>
                        <span
                          className={classes.iconBox}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFeedbackModal(feedback.id);
                          }}
                        >
                          <Image
                            src="/assets/svgs/delete.svg"
                            alt="delete"
                            width={0}
                            height={0}
                            style={{
                              width:
                                "clamp(0.5rem, 0.419rem + 0.38vw, 0.875rem)",
                              height:
                                "clamp(0.5rem, 0.419rem + 0.38vw, 0.875rem)",
                            }}
                          />
                        </span>
                      </Tooltip>
                      <div
                        className={`${classes.chevronIcon} ${
                          isExpanded ? classes.chevronExpanded : ""
                        }`}
                      >
                        {isExpanded ? (
                          <ChevronUp
                            style={{
                              width: "clamp(0.625rem, 0.544rem + 0.38vw, 1rem)",
                              height:
                                "clamp(0.625rem, 0.544rem + 0.38vw, 1rem)",
                            }}
                          />
                        ) : (
                          <ChevronDown
                            style={{
                              width: "clamp(0.625rem, 0.544rem + 0.38vw, 1rem)",
                              height:
                                "clamp(0.625rem, 0.544rem + 0.38vw, 1rem)",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${classes.reasonsQuestionBox} ${
                      isExpanded ? classes.expanded : classes.collapsed
                    }`}
                  >
                    <div className={classes.reasonsQuestionBoxContent}>
                      <div className={classes.reasons}>
                        <p className={classes.enrollmentInfoField}>Reasons:</p>
                        <div className={classes.reasonBox}>
                          {feedback.feedbackReasons.map(
                            (fr: any, index: number) => (
                              <div key={fr.id} className={classes.reason}>
                                <span>{index + 1}. </span>
                                {fr.reason.reason}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      <div className={classes.reasons}>
                        <p className={classes.enrollmentInfoField}>QnA:</p>
                        <div className={classes.reasonBox}>
                          {feedback.feedbackAnswers.map(
                            (fr: any, index: number) => (
                              <div key={fr.id} className={classes.qnaBox}>
                                <div className={classes.question}>
                                  <span>{index + 1}. </span>
                                  {fr.question.question}
                                </div>
                                <div className={classes.reason}>
                                  <span>Ans. </span>
                                  {fr.answer_text || "No Show"}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={classes.actionBox}>
          <Tooltip title="Add Feedback" arrow>
            <span>
              <Button
                inlineStyling={{
                  padding: "5px",
                  borderRadius: "50%",
                  height: "clamp(1.25rem, 1.116rem + 0.633vw, 1.875rem)",
                  width: "clamp(1.25rem, 1.116rem + 0.633vw, 1.875rem)",
                  minHeight: "0px",
                  alignSelf: "flex-end",
                  filter: "drop-shadow(2px 2px 4px rgba(56, 182, 255, 0.40))",
                }}
                icon={<Plus />}
                clickFn={() => handleMoreFeedbackModal(churnId)}
              />
            </span>
          </Tooltip>
          <Tooltip title="Churn Details" arrow>
            <span
              className={classes.iconBox}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${role}/churn-details/${churnId}`);
              }}
            >
              <TurnRightIcon
                sx={{
                  width: "clamp(0.625rem, 0.544rem + 0.38vw, 1rem)",
                  height: "clamp(0.625rem, 0.544rem + 0.38vw, 1rem)",
                }}
              />
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ChurnCard;
