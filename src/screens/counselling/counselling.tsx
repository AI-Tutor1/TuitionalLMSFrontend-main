import React, { useCallback, useEffect, useState, useMemo } from "react";
import classes from "./counselling.module.css";
import InputField from "@/components/global/input-field/input-field";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { getUserById } from "@/services/dashboard/superAdmin/uers/users";
import { useParams, useSearchParams } from "next/navigation";
import { ROLES } from "@/const/dashboard/role_ids_names";
import { getAllEnrollments } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import Button from "@/components/global/button/button";
import DropDownObjects from "@/components/global/dropDown-objects/dropDown-objects";
import AddIcon from "@mui/icons-material/Add";
import TextBox from "@/components/global/text-box/text-box";
import EnrollmenReviewModal from "@/components/ui/superAdmin/counseling/enrollmentReiew-modal/enrollmentReiew-modal";

const Counselling = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const roleId = searchParams.get("roleId") || null;
  const { control, handleSubmit } = useForm({
    defaultValues: {
      school: "",
      satisfaction_rating: "",
      learning_preference: "",
      group_session_subjects: "",
      individual_session_subjects: "",
      tutor_name: "",
      tutor_review: "",
      student_strengths: "",
      student_weaknesses: "",
    },
  });
  const { token } = useAppSelector((state) => state.user);
  const { subject } = useAppSelector((state) => state.resources);
  const { teachers } = useAppSelector((state) => state?.usersByGroup);
  const role = roleId ? ROLES[Number(roleId) as keyof typeof ROLES] : undefined;
  const [showSchool, setShowSchool] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<
    string | null
  >(null);
  const [reviewText, setReviewText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEnrollmentForReview, setCurrentEnrollmentForReview] = useState<
    string | null
  >(null);
  const [enrollmentReviews, setEnrollmentReviews] = useState<
    Record<string, string[]>
  >({});

  const filteredTeachers = useMemo(
    () => teachers?.users?.map((item) => JSON.stringify(item)) || [],
    [teachers?.users]
  );
  const filteredSubjects = useMemo(
    () => subject?.map((item) => JSON.stringify(item)) || [],
    [teachers?.users]
  );

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
    refetch: userRefetch,
  } = useQuery({
    queryKey: ["getUserById", id],
    queryFn: () => getUserById({ id: id as string }, { token }),
    staleTime: 300000,
    enabled: !!token && !!id,
    refetchOnWindowFocus: false,
  });

  const {
    data: enrollmentsData,
    error: enrollmentsError,
    isLoading: enrollmentsLoading,
  } = useQuery({
    queryKey: ["enrollments", "for-counselling", role, id],
    queryFn: () =>
      getAllEnrollments(
        {
          student_id: role === "student" ? String(id) : "",
          teacher_id: role === "teacher" ? String(id) : "",
        },
        { token }
      ),
    staleTime: 300000,
    enabled: !!token && !!id && !!role,
    refetchOnWindowFocus: false,
  });

  const onSubmit = useCallback((data: any) => {
    console.log("Form submitted with data:", data);
    // Add your submit logic here
  }, []);

  const handleEditSchool = () => {
    setShowSchool(!showSchool);
  };

  const handleEnrollmentClick = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setReviewText("");
  };

  const handleReviewSubmit = () => {
    if (!selectedEnrollmentId || !reviewText.trim()) {
      toast.error("Please enter a review");
      return;
    }

    console.log(
      "Review submitted for enrollment:",
      selectedEnrollmentId,
      "Review:",
      reviewText
    );
    toast.success("Review submitted successfully");
    setSelectedEnrollmentId(null);
    setReviewText("");
  };

  const handleCancelReview = () => {
    setSelectedEnrollmentId(null);
    setReviewText("");
  };

  const handleOpenReviewModal = (enrollmentId: string) => {
    setCurrentEnrollmentForReview(enrollmentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEnrollmentForReview(null);
  };

  const handleModalSubmit = (data: { review: string }) => {
    if (!currentEnrollmentForReview) {
      toast.error("No enrollment selected");
      return;
    }

    setEnrollmentReviews((prev) => ({
      ...prev,
      [currentEnrollmentForReview]: [
        ...(prev[currentEnrollmentForReview] || []),
        data.review.trim(),
      ],
    }));

    toast.success("Review submitted successfully");
    handleCloseModal();
  };

  useEffect(() => {
    if (userError || enrollmentsError) {
      const axiosError = (userError || enrollmentsError) as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError.response.data.error || axiosError.response.data.message
        );
      } else if (axiosError?.message) {
        toast.error(axiosError.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }, [userError, enrollmentsError]);

  if (userLoading || enrollmentsLoading) {
    return <LoadingBox />;
  }

  return (
    <div className={classes.container}>
      <div className={classes.userInfo}>
        <header>
          <h3>User Info</h3>
          <div>
            <span>
              <AddIcon sx={{ color: "white", fontSize: "1.375rem" }} />{" "}
            </span>
            <p>Pour</p>
          </div>
        </header>

        <div className={classes.imageNameBox}>
          <Image
            src={userData?.profileImageUrl || "/assets/images/demmyPic.png"}
            alt=""
            width={100}
            height={100}
            priority
          />
          <p>{userData?.name || "No Show"}</p>
        </div>
        <div className={classes.userInfoBox}>
          <div className={classes.fields}>
            <p>Id</p>
            <p>{userData?.id || "No Show"}</p>
          </div>
          <div className={classes.fields}>
            <p>Email</p>
            <p>{userData?.email || "No Show"}</p>
          </div>
          <div className={classes.fields}>
            <p>Phone</p>
            <p>
              {userData?.phone_number ? `${userData.phone_number}` : "No Show"}
            </p>
          </div>
          <div className={classes.fields}>
            <p>Role</p>
            <p>{role || "No Show"}</p>
          </div>
          <div className={classes.fields}>
            <p>Country</p>
            <p>{userData?.country || userData?.country_code || "No Show"}</p>
          </div>
          <div className={classes.fields}>
            <p>Gender</p>
            <p>{userData?.gender || "No Show"}</p>
          </div>
          <div className={classes.fields}>
            <p>City</p>
            <p>{userData?.city || "No Show"}</p>
          </div>
        </div>
      </div>

      <div className={classes.enrollmentInfo}>
        <h3>Enrollments </h3>
        {enrollmentsData && enrollmentsData?.data?.length > 0 ? (
          <div className={classes.enrollmentBox}>
            {enrollmentsData.data.map((item: any, index: number) => (
              <div className={classes.enrollmentMainItem}>
                <div key={item?.id || index} className={classes.enrollmentItem}>
                  <div className={classes.enrollmentContent}>
                    <p className={classes.enrollment}>
                      {index + 1}. {item?.name || "No enrollments available"}
                    </p>
                    {/* Display reviews for this enrollment inside the enrollment box */}
                    {enrollmentReviews[String(item?.id)] &&
                      enrollmentReviews[String(item?.id)].length > 0 && (
                        <div className={classes.reviewsInside}>
                          <h5>Review:</h5>
                          {enrollmentReviews[String(item?.id)].map(
                            (review, reviewIndex) => (
                              <div
                                key={reviewIndex}
                                className={classes.reviewItemInside}
                              >
                                <p>"{review}"</p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
                <div className={classes.enrollmentActionsBox}>
                  <div className={classes.enrollmentActions}>
                    <span>
                      <AddIcon sx={{ fontSize: "1.25rem", color: "white" }} />{" "}
                    </span>
                    <p>Product Review</p>
                  </div>
                  <div
                    className={classes.enrollmentActions}
                    onClick={() => handleOpenReviewModal(String(item?.id))}
                  >
                    <span>
                      <AddIcon sx={{ fontSize: "1.25rem", color: "white" }} />{" "}
                    </span>
                    <p>Review</p>
                  </div>
                  <div className={classes.enrollmentActions}>
                    <span>
                      <AddIcon sx={{ fontSize: "1.25rem", color: "white" }} />{" "}
                    </span>
                    <p>Pour</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ErrorBox message="No enrollments found!" />
        )}
      </div>

      <div className={classes.counsellorForm}>
        <h3>Counsellor Form</h3>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={classes.counsellorFormFieldBox}
        >
          <div className={classes.fields}>
            <p>School Name</p>
            <Controller
              control={control}
              name="school"
              render={({ field }) => (
                <InputField
                  placeholder="Enter School"
                  type="text"
                  inputStyles={{ fontSize: "1rem" }}
                  {...field}
                />
              )}
            />
          </div>

          <div className={classes.fields}>
            <p>
              Subjects student is taking with Tuitional in Individualized
              Sessions *
            </p>
            <Controller
              control={control}
              name="individual_session_subjects"
              render={({ field }) => (
                <DropDownObjects
                  placeholder="Enter tutional subjects"
                  data={filteredSubjects}
                  handleChange={() => {}}
                  fontSize="1rem"
                  {...field}
                />
              )}
            />
          </div>

          <div className={classes.fields}>
            <p>Subjects taking in Group Sessions *</p>
            <Controller
              control={control}
              name="group_session_subjects"
              render={({ field }) => (
                <InputField
                  placeholder="Enter subjects"
                  type="text"
                  inputStyles={{ fontSize: "1rem" }}
                  {...field}
                />
              )}
            />
          </div>

          <div className={classes.fields}>
            <p>On a scale of 1 to 5, how satisfied are you with Tuitional?</p>
            <Controller
              control={control}
              name="satisfaction_rating"
              render={({ field }) => (
                <InputField
                  placeholder="Rate from 1 - 10"
                  inputStyles={{ fontSize: "1rem" }}
                  type="text"
                  {...field}
                />
              )}
            />
          </div>

          <div className={classes.fields}>
            <p>
              How do you prefer to learn? (E.g., visual, auditory,
              reading/writing)
            </p>
            <Controller
              control={control}
              name="learning_preference"
              render={({ field }) => (
                <TextBox
                  placeholder="Enter your learning preference"
                  className={classes.noFocus}
                  {...field}
                />
              )}
            />
          </div>

          <div className={classes.fields}>
            <p>Strengths of the student *</p>
            <Controller
              control={control}
              name="student_strengths"
              render={({ field }) => (
                <TextBox
                  placeholder="Enter student strengths"
                  {...field}
                  className={classes.noFocus}
                />
              )}
            />
          </div>

          <div className={classes.fields}>
            <p>Weaknesses of the student *</p>
            <Controller
              control={control}
              name="student_weaknesses"
              render={({ field }) => (
                <TextBox
                  placeholder="Enter student weaknesses"
                  {...field}
                  className={classes.noFocus}
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            text="Submit Form"
            type="submit"
            inlineStyling={{ gridColumn: "span 3" }}
          />
        </form>
      </div>

      <EnrollmenReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        handleAdd={handleModalSubmit}
        heading="Review Modal"
        subHeading="Please provide your review for this enrollment"
      />
    </div>
  );
};

export default Counselling;
