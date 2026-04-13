import { CSSProperties } from "react";
import classes from "./mobileViewCard.module.css";
import Image from "next/image";
import { Tooltip } from "@mui/material";
import moment from "moment";
import PaginationComponent from "@/components/global/pagination/pagination";
import { useParams } from "next/navigation";
import ErrorBox from "@/components/global/error-box/error-box";

// Reusable icon props
const iconProps = {
  width: 0,
  height: 0,
  style: {
    width: "var(--regular16-)",
    height: "var(--regular16-)",
  },
} as const;

// Interfaces matching the API response
interface UserRole {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
  role?: UserRole;
  country_code?: string;
}

interface SessionFeedback {
  id: number;
  sessionId: number;
  userId: number;
  rating: number;
  feeling: number;
  comment: string | null;
  concerns: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: User;
}

interface Tutor {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
}

interface StudentGroup {
  id: number;
  group_id: string;
  student_id: number;
  enrollment_id: number;
  user: User;
}

interface SessionEnrollment {
  id: number;
  name: string;
  subject_id: number;
  curriculum_id: number;
  board_id: number;
  grade_id: number;
  subject: { id: number; name: string };
  curriculum: { id: number; name: string };
  board: { id: number; name: string };
  grade: { id: number; name: string };
  studentsGroups: StudentGroup[];
}

interface SessionItem {
  id: number;
  class_schedule_id: number | null;
  subject_id: number;
  board_id: number;
  curriculum_id: number;
  grade_id: number;
  enrollment_id: number;
  meeting_link: string;
  tag: string;
  space_name: string;
  duration: number;
  created_at: string;
  meet_recording: string | null;
  tutor_class_time: number;
  tutor_scaled_class_time: number;
  tutor_id: number;
  student_group_id: string;
  conclusion_type: string;
  session_remarks: string | null;
  extended_duration: number;
  is_reviewed: boolean;
  reviewed_by: number | null;
  sessionFeedbacks: SessionFeedback[];
  tutor: Tutor;
  sessionEnrollment: SessionEnrollment;
}

interface MobileViewCardProps {
  data?: SessionItem[];
  handleDeleteModal: (id: number) => void;
  handleEditModal?: (e: React.MouseEvent, item: SessionFeedback) => void;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage: (e: any, newPage: number) => void;
  handleChangeRowsPerPage: (e: any) => void;
  rowsPerPage?: number;
  isLoading?: boolean;
  inlineStyling?: CSSProperties;
}

// Star Rating Component
const StarRating = ({
  rating,
  maxStars = 5,
}: {
  rating: number;
  maxStars?: number;
}) => {
  return (
    <div className={classes.starRating}>
      {[...Array(maxStars)].map((_, index) => (
        <span
          key={index}
          className={index < rating ? classes.starFilled : classes.starEmpty}
        >
          ★
        </span>
      ))}
      <span className={classes.ratingValue}>({rating})</span>
    </div>
  );
};

const MobileViewCard: React.FC<MobileViewCardProps> = ({
  currentPage,
  totalPages,
  totalCount,
  data,
  handleDeleteModal,
  handleEditModal,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  isLoading,
  inlineStyling,
}) => {
  const { role } = useParams();
  // Helper function to get student name from enrollment name string
  const getStudentName = (enrollmentName?: string): string => {
    if (!enrollmentName) return "N/A";
    const namePart = enrollmentName.split(" - ")[0];
    return namePart?.split("/")[0]?.trim() || "N/A";
  };

  // Helper function to get tutor name from enrollment name string
  const getTutorName = (enrollmentName?: string): string => {
    if (!enrollmentName) return "N/A";
    const namePart = enrollmentName.split(" - ")[0];
    return namePart?.split("/")[1]?.trim() || "N/A";
  };

  // Filter feedbacks by role - separated for each role
  const getStudentFeedbacks = (
    feedbacks: SessionFeedback[],
  ): SessionFeedback[] => {
    return feedbacks.filter((fb) => fb.user?.role?.name === "Student");
  };

  const getTutorFeedbacks = (
    feedbacks: SessionFeedback[],
  ): SessionFeedback[] => {
    return feedbacks.filter((fb) => fb.user?.role?.name === "Teacher");
  };

  const getAdminFeedbacks = (
    feedbacks: SessionFeedback[],
  ): SessionFeedback[] => {
    return feedbacks.filter(
      (fb) =>
        fb.user?.role?.name === "Super Admin" ||
        fb.user?.role?.name === "Admin" ||
        fb.user?.role?.name === "Manager",
    );
  };

  return (
    <div className={classes.mobileViewContainer} style={inlineStyling}>
      <div className={classes.scrollBox}>
        {data?.map((item, index) => {
          const { id, created_at, sessionEnrollment, sessionFeedbacks, tutor } =
            item;

          const studentFeedbacks = getStudentFeedbacks(sessionFeedbacks || []);
          const tutorFeedbacks = getTutorFeedbacks(sessionFeedbacks || []);
          const adminFeedbacks = getAdminFeedbacks(sessionFeedbacks || []);

          return (
            <div className={classes.container} key={id || index}>
              <div className={classes.header}>
                <div className={classes.status}>
                  <span className={classes.date}>
                    Session ID: {id || "N/A"}
                  </span>
                </div>
                <span className={classes.date}>
                  {created_at
                    ? moment.utc(created_at).local().format("Do-MMM-YYYY")
                    : "N/A"}
                </span>
              </div>

              <div className={classes.profileSection}>
                {/* Enrollment Section */}
                <div className={classes.enrollmentSection}>
                  <h3 className={classes.enrollmentSectionTitle}>Enrollment</h3>
                  <div className={classes.field}>
                    <span className={classes.label}>Enrollment Id</span>
                    <span className={classes.value}>
                      {sessionEnrollment?.id || "N/A"}
                    </span>
                  </div>
                  <div className={classes.field}>
                    <span className={classes.label}>Student Name</span>
                    <span className={classes.value}>
                      {getStudentName(sessionEnrollment?.name)}
                    </span>
                  </div>
                  <div className={classes.field}>
                    <span className={classes.label}>Tutor Name</span>
                    <span className={classes.value}>
                      {tutor?.name || getTutorName(sessionEnrollment?.name)}
                    </span>
                  </div>
                  <div className={classes.field}>
                    <span className={classes.label}>Subject</span>
                    <span className={classes.value}>
                      {sessionEnrollment?.subject?.name || "N/A"}
                    </span>
                  </div>
                  {/* <div className={classes.field}>
                    <span className={classes.label}>Grade</span>
                    <span className={classes.value}>
                      {sessionEnrollment?.grade?.name || "N/A"}
                    </span>
                  </div>
                  <div className={classes.field}>
                    <span className={classes.label}>Curriculum</span>
                    <span className={classes.value}>
                      {sessionEnrollment?.curriculum?.name || "N/A"}
                    </span>
                  </div> */}
                </div>

                {/* Student Feedbacks Section - Only show if student feedbacks exist */}
                {studentFeedbacks.length > 0 && (
                  <div className={classes.feedbacksContainer}>
                    <h3 className={classes.feedbacksContainerTitle}>
                      Student Feedback
                    </h3>
                    {studentFeedbacks.map((feedback) => (
                      <div className={classes.feedbackContent}>
                        <div key={feedback.id} className={classes.feedbackItem}>
                          <div className={classes.field}>
                            <span className={classes.label}>Student</span>
                            <span className={classes.value}>
                              {feedback.user?.name || "N/A"}
                            </span>
                          </div>
                          <div className={classes.field}>
                            <span className={classes.label}>Rating</span>
                            {feedback.rating ? (
                              <StarRating rating={feedback.rating} />
                            ) : (
                              <span className={classes.value}>N/A</span>
                            )}
                          </div>
                          <div
                            className={classes.field}
                            style={{ minWidth: "100%" }}
                          >
                            <span className={classes.label}>Concerns</span>
                            <span className={classes.value}>
                              {feedback.concerns ? (
                                <ul className={classes.concernsList}>
                                  {feedback.concerns
                                    .split(",")
                                    .map((concern, idx) => (
                                      <li key={idx}>{concern.trim()}</li>
                                    ))}
                                </ul>
                              ) : (
                                "N/A"
                              )}
                            </span>
                          </div>
                          <div
                            className={classes.field}
                            style={{ minWidth: "100%" }}
                          >
                            <span className={classes.label}>Comment</span>
                            <span
                              className={`${classes.value} ${classes.commentValue}`}
                            >
                              {feedback.comment || "N/A"}
                            </span>
                          </div>
                        </div>
                        {role === "superAdmin" && (
                          <Tooltip title="Update" placement="bottom" arrow>
                            <span
                              className={classes.iconBox}
                              onClick={(e: React.MouseEvent) =>
                                handleEditModal?.(e, feedback)
                              }
                            >
                              <Image
                                src="/assets/svgs/edit.svg"
                                alt="edit"
                                {...iconProps}
                              />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tutor Feedbacks Section - Only show if tutor feedbacks exist */}
                {tutorFeedbacks.length > 0 && (
                  <div className={classes.feedbacksContainer}>
                    <h3 className={classes.feedbacksContainerTitle}>
                      Tutor Feedback
                    </h3>
                    {tutorFeedbacks.map((feedback) => (
                      <div className={classes.feedbackContent}>
                        <div key={feedback.id} className={classes.feedbackItem}>
                          <div className={classes.field}>
                            <span className={classes.label}>Tutor</span>
                            <span className={classes.value}>
                              {feedback.user?.name || "N/A"}
                            </span>
                          </div>
                          <div className={classes.field}>
                            <span className={classes.label}>Rating</span>
                            {feedback.rating ? (
                              <StarRating rating={feedback.rating} />
                            ) : (
                              <span className={classes.value}>N/A</span>
                            )}
                          </div>
                          <div
                            className={classes.field}
                            style={{ minWidth: "100%" }}
                          >
                            <span className={classes.label}>Concerns</span>
                            <span className={classes.value}>
                              {feedback.concerns ? (
                                <ul className={classes.concernsList}>
                                  {feedback.concerns
                                    .split(",")
                                    .map((concern, idx) => (
                                      <li key={idx}>{concern.trim()}</li>
                                    ))}
                                </ul>
                              ) : (
                                "N/A"
                              )}
                            </span>
                          </div>
                          <div
                            className={classes.field}
                            // style={{ minWidth: "100%" }}
                          >
                            <span className={classes.label}>Comment</span>
                            <span
                              className={`${classes.value} ${classes.commentValue}`}
                            >
                              {feedback.comment || "N/A"}
                            </span>
                          </div>
                        </div>
                        {role === "superAdmin" && (
                          <Tooltip title="Update" placement="bottom" arrow>
                            <span
                              className={classes.iconBox}
                              onClick={(e: React.MouseEvent) =>
                                handleEditModal?.(e, feedback)
                              }
                            >
                              <Image
                                src="/assets/svgs/edit.svg"
                                alt="edit"
                                {...iconProps}
                              />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Admin Feedbacks Section - Only show if admin feedbacks exist */}
                {adminFeedbacks.length > 0 && (
                  <div className={classes.feedbacksContainer}>
                    <h3 className={classes.feedbacksContainerTitle}>
                      Admin Feedback
                    </h3>
                    {adminFeedbacks.map((feedback) => (
                      <div className={classes.feedbackContent}>
                        <div key={feedback.id} className={classes.feedbackItem}>
                          <div className={classes.field}>
                            <span className={classes.label}>Admin</span>
                            <span className={classes.value}>
                              {feedback.user?.name || "N/A"}
                            </span>
                          </div>
                          <div className={classes.field}>
                            <span className={classes.label}>Rating</span>
                            {feedback.rating ? (
                              <StarRating rating={feedback.rating} />
                            ) : (
                              <span className={classes.value}>N/A</span>
                            )}
                          </div>
                          <div
                            className={classes.field}
                            style={{ minWidth: "100%" }}
                          >
                            <span className={classes.label}>Concerns</span>
                            <span className={`${classes.value}`}>
                              {feedback.concerns ? (
                                <ul className={classes.concernsList}>
                                  {feedback.concerns
                                    .split(",")
                                    .map((concern, idx) => (
                                      <li key={idx}>{concern.trim()}</li>
                                    ))}
                                </ul>
                              ) : (
                                "N/A"
                              )}
                            </span>
                          </div>
                          <div
                            className={classes.field}
                            style={{ minWidth: "100%" }}
                          >
                            <span className={classes.label}>Comment</span>
                            <span
                              className={`${classes.value} ${classes.commentValue}`}
                            >
                              {feedback.comment || "N/A"}
                            </span>
                          </div>
                        </div>
                        {role === "superAdmin" && (
                          <Tooltip title="Update" placement="bottom" arrow>
                            <span
                              className={classes.iconBox}
                              onClick={(e: React.MouseEvent) =>
                                handleEditModal?.(e, feedback)
                              }
                            >
                              <Image
                                src="/assets/svgs/edit.svg"
                                alt="edit"
                                {...iconProps}
                              />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Show message if no feedbacks at all */}
                {studentFeedbacks.length === 0 &&
                  tutorFeedbacks.length === 0 &&
                  adminFeedbacks.length === 0 && <ErrorBox />}
                {/* Action Icons */}
              </div>
              {role === "superAdmin" && (
                <div className={classes.iconsContainer}>
                  <Tooltip title="Delete" placement="bottom" arrow>
                    <span
                      className={classes.iconBox}
                      onClick={() => {
                        handleDeleteModal(id);
                      }}
                    >
                      <Image
                        src="/assets/svgs/delete.svg"
                        alt="delete"
                        {...iconProps}
                      />
                    </span>
                  </Tooltip>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <PaginationComponent
        totalPages={totalPages || 1}
        page={currentPage || 1}
        rowsPerPage={rowsPerPage || 15}
        totalEntries={totalCount || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[15, 30, 50]}
        inlineStyles={{ padding: "0px", width: "100%" }}
      />
    </div>
  );
};

export default MobileViewCard;
