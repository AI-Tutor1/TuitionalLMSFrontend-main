import React, { memo, useCallback, useState, useMemo } from "react";
import classes from "./section1.module.css";
import Button from "@/components/global/button/button";
import SubjectsComponent from "./subjects-component/subjects-component";
import { Box } from "@mui/material";
import Image from "next/image";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AddIcon from "@mui/icons-material/Add";
import GenerateMeetLink from "@/components/ui/superAdmin/tutor-profile/meetLink-modal/meetLink-modal";
import { MyAxiosError } from "@/services/error.type";
import { useMutation } from "@tanstack/react-query";
import { generateInterviewLink } from "@/services/dashboard/superAdmin/tutor-request/tutor-request";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Link from "next/link";
import { approvedRequest } from "@/services/dashboard/superAdmin/tutor-request/tutor-request";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import ErrorBox from "@/components/global/error-box/error-box";

interface Section1Props {
  data: any;
  refetch?: () => void;
}

// Memoized button styles outside component to prevent recreation
const BUTTON_STYLES = {
  accept: {
    borderRadius: "5px",
    width: "100%",
  },
  decline: {
    backgroundColor: "transparent",
    border: "1px solid var(--main-color)",
    color: "var(--main-color)",
    borderRadius: "5px",
    width: "100%",
  },
} as const;

const DROPDOWN_STYLES = {
  dropDownStyles: {
    width: "calc(40% - 10px)",
    backgroundColor: "var(--white-color)",
    boxShadow: "0px -1px 4px 0px rgba(56, 182, 255, 0.35) inset",
  },
} as const;

// Extract status color calculation to a pure function
const getStatusStyles = (status: string) => {
  const styles = {
    width: "max-content",
    padding: "5px 10px",
    borderRadius: "5px",
  };

  switch (status?.toLowerCase()) {
    case "pending":
      return { ...styles, color: "#716E3D", backgroundColor: "#FFFAA0" };
    case "approved":
      return { ...styles, color: "#286320", backgroundColor: "#A0FFC0" };
    default:
      return { ...styles, color: "#653838", backgroundColor: "#FFACAC" };
  }
};

// Memoized ProfileSection component
const ProfileSection = memo(
  ({ tutorData, data }: { tutorData: any; data: any }) => {
    const displayName = useMemo(() => {
      const fullName = tutorData?.firstName || "Unknown";
      return fullName.split(" ").slice(0, 2).join(" ");
    }, [tutorData?.firstName]);

    const statusStyles = useMemo(
      () => getStatusStyles(data?.status),
      [data?.status],
    );

    return (
      <div className={classes.box1_inner}>
        <div className={classes.imageBox}>
          <Image
            src={tutorData?.profileImage || "/assets/images/dummyPic.png"}
            alt="Tutor Profile"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className={classes.textBox}>
          <p className={classes.name}>{displayName}</p>
          <p className={classes.email}>{tutorData?.email || "No email"}</p>
          <p className={classes.iconBox}>
            <span>
              <PhoneOutlinedIcon />
            </span>
            {tutorData?.phone || "No phone"}
          </p>
          <span className={classes.status} style={statusStyles}>
            {data?.status || "No Show"}
          </span>
        </div>
      </div>
    );
  },
);
ProfileSection.displayName = "ProfileSection";

// Memoized ActionButtons component
const ActionButtons = memo(
  ({
    meetLink,
    onOpenMeetLink,
  }: {
    meetLink?: string;
    onOpenMeetLink: () => void;
  }) => (
    <div className={classes.actionButtonBox}>
      {meetLink && (
        <Link
          href={meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.meetLinkButton}
        >
          Open Meet Link
        </Link>
      )}
      <Button
        text="Get Meet Link"
        icon={<AddIcon />}
        clickFn={onOpenMeetLink}
      />
    </div>
  ),
);
ActionButtons.displayName = "ActionButtons";

// Memoized SubjectsList component with filter functionality
const SubjectsList = memo(
  ({
    subjects,
    currency,
    onAddSubject,
    status,
    filteredSubjects,
    selectedSubject,
    onSubjectFilter,
  }: {
    subjects: any[];
    currency: string;
    onAddSubject: (subject: any) => void;
    status: string;
    filteredSubjects: any[];
    selectedSubject: any;
    onSubjectFilter: (value: any) => void;
  }) => (
    <Box className={classes.box2}>
      <div className={classes.heading}>
        Subjects
        <FilterDropdown
          inlineBoxStyles={DROPDOWN_STYLES.dropDownStyles}
          placeholder="Filter Subject"
          data={filteredSubjects}
          handleChange={onSubjectFilter}
          value={JSON.stringify(selectedSubject) || ""}
          dropDownObject
        />
      </div>
      <div className={classes.subjectsBox}>
        {subjects && subjects.length > 0 ? (
          subjects.map((item: any, indx: number) => (
            <SubjectsComponent
              key={`subject-${
                item?.id || `${item?.level}-${item?.name}-${indx}`
              }`}
              item={item}
              currency={currency}
              handleChecked={onAddSubject}
              status={status}
            />
          ))
        ) : (
          <ErrorBox message={"No subject found!"} />
        )}
      </div>
    </Box>
  ),
);
SubjectsList.displayName = "SubjectsList";

const Section1: React.FC<Section1Props> = memo(({ data, refetch }) => {
  const { id } = useParams();
  const { subject } = useAppSelector((state) => state?.resources);
  const tutorData = useMemo(
    () => data?.parsed_jsonData || {},
    [data?.parsed_jsonData],
  );
  // Memoized filtered subjects from Redux store
  const filteredSubjects = useMemo(
    () => subject?.map((item) => JSON.stringify(item)) || [],
    [subject],
  );
  const token = useAppSelector((state) => state.user.token);
  const [meetLinkModal, setMeetLinkModal] = useState<boolean>(false);
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Filter subjects based on selected filter
  const filteredSubjectsList = useMemo(() => {
    if (!data?.parsed_jsonData?.subjects) return [];
    if (!selectedSubject) {
      return data.parsed_jsonData.subjects;
    }
    return data.parsed_jsonData.subjects.filter(
      (item: any) => item.name === selectedSubject?.name,
    );
  }, [data?.parsed_jsonData?.subjects, selectedSubject]);

  // Handle subject filter change
  const handleSubjectFilter = useCallback((e: any) => {
    const value = JSON.parse(e.target.value);
    setSelectedSubject(value);
  }, []);

  // Memoized modal handlers
  const handleCloseMeetLinkModal = useCallback(
    () => setMeetLinkModal(false),
    [],
  );
  const handleOpenMeetLinkModal = useCallback(() => setMeetLinkModal(true), []);

  // Optimized addSubjects with better memoization
  const addSubjects = useCallback((subject: any) => {
    setSelectedSubjects((prev) => {
      const sameElementIndex = prev.findIndex(
        (item) =>
          item.level === subject.level &&
          item.name === subject.name &&
          item.curriculum === subject.curriculum &&
          item.board === subject.board,
      );

      if (sameElementIndex !== -1) {
        // Only update if actually changed
        if (
          prev[sameElementIndex].rate === subject.rate &&
          prev[sameElementIndex].is_approved === subject.is_approved
        ) {
          return prev;
        }
        const updatedSubjects = [...prev];
        updatedSubjects[sameElementIndex] = {
          ...updatedSubjects[sameElementIndex],
          rate: subject.rate,
          is_approved: subject.is_approved,
        };
        return updatedSubjects;
      }
      return [...prev, subject];
    });
  }, []);

  // Memoized mutation options
  const generateLinkOptions = useMemo(
    () => ({
      onSuccess: (response: any) => {
        toast.success(
          response?.message || "Meeting link generated successfully",
        );
        setMeetLinkModal(false);
        refetch?.();
      },
      onError: (error: MyAxiosError) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "An error occurred";
        toast.error(errorMessage);
      },
    }),
    [refetch],
  );

  const approveRequestOptions = useMemo(
    () => ({
      onSuccess: (response: any) => {
        toast.success(response?.message || "Request approved successfully");
        setSelectedSubjects([]);
        refetch?.();
        alert(
          `This is one time password please copy this, ${response?.password}`,
        );
      },
      onError: (error: MyAxiosError) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "An error occurred";
        toast.error(errorMessage);
        setSelectedSubjects([]);
      },
    }),
    [refetch],
  );

  const generateLinkMutation = useMutation({
    mutationFn: (payload: { interviewDate: string }) =>
      generateInterviewLink(Number(id), { token }, payload),
    ...generateLinkOptions,
  });

  const approveRequestMutation = useMutation({
    mutationFn: (payload: { jsonData: any; id: number }) =>
      approvedRequest({ token }, payload),
    ...approveRequestOptions,
  });

  const handleGenerateLink = useCallback(
    (payload: { interviewDate: string }) => {
      generateLinkMutation.mutate(payload);
    },
    [generateLinkMutation],
  );

  const handleApprovedRequest = useCallback(() => {
    const newJsonData = {
      ...data,
      parsed_jsonData: {
        ...data.parsed_jsonData,
        subjects: data?.parsed_jsonData?.subjects?.map((subjectItem: any) => {
          const selectedSubject = selectedSubjects.find(
            (selectedItem) =>
              selectedItem.level === subjectItem.level &&
              selectedItem.name === subjectItem.name &&
              selectedItem.curriculum === subjectItem.curriculum &&
              selectedItem.board === subjectItem.board,
          );

          return selectedSubject || { ...subjectItem, is_approved: false };
        }),
      },
    };

    approveRequestMutation.mutate({
      jsonData: JSON.stringify(newJsonData),
      id: Number(id),
    });
  }, [selectedSubjects, data, id, approveRequestMutation]);

  // Memoize whether to show approve/decline buttons
  const showActionButtons = useMemo(
    () => data?.status !== "Approved",
    [data?.status],
  );

  return (
    <div className={classes.container}>
      <Box className={classes.box1}>
        <ProfileSection tutorData={tutorData} data={data} />
        <ActionButtons
          meetLink={tutorData?.meetLink}
          onOpenMeetLink={handleOpenMeetLinkModal}
        />
      </Box>
      <SubjectsList
        subjects={filteredSubjectsList}
        currency={tutorData?.currency}
        onAddSubject={addSubjects}
        status={data?.status}
        filteredSubjects={filteredSubjects}
        selectedSubject={selectedSubject}
        onSubjectFilter={handleSubjectFilter}
      />
      {showActionButtons && (
        <div className={classes.buttonBox}>
          <Button
            text="Accept"
            inlineStyling={BUTTON_STYLES.accept}
            clickFn={handleApprovedRequest}
            loading={approveRequestMutation.isPending}
            disabled={approveRequestMutation.isPending}
          />
          <Button text="Decline" inlineStyling={BUTTON_STYLES.decline} />
        </div>
      )}
      <GenerateMeetLink
        modalOpen={meetLinkModal}
        handleClose={handleCloseMeetLinkModal}
        loading={generateLinkMutation.isPending}
        success={generateLinkMutation.isSuccess}
        heading="Generate New Meet Link"
        subHeading="Select date and time for the meeting"
        handleGenerateLink={handleGenerateLink}
      />
    </div>
  );
});

Section1.displayName = "Section1";

export default Section1;
