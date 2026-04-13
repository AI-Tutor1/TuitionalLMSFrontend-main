import React, { useEffect, useState, useMemo } from "react";
import { interviewsAligned } from "@/services/dashboard/superAdmin/tutor-request/tutor-request";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import LoadingBox from "@/components/global/loading-box/loading-box"; // Add proper import
import Card from "./components/card/card"; // Add proper import
import classes from "./tutor-interviews.module.css"; // Add proper import
import Image from "next/image";
import moment from "moment";

interface TutorInterviewsProps {
  tabChange?: (tab: string) => void;
}

const TutorInterviews: React.FC<TutorInterviewsProps> = () => {
  const { token } = useAppSelector((state) => state.user);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["tutorInterviews"],
    queryFn: () =>
      interviewsAligned(
        {
          limit: null,
          offset: null,
          startDate: moment().startOf("day").format("YYYY-MM-DD"),
          // endDate: moment().endOf("day").format("YYYY-MM-DD"),
        },
        { token }
      ),
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const parsedData = useMemo(() => {
    return (
      data?.map((item: any) => {
        const parsed_jsonData = item.jsonData
          ? JSON.parse(item.jsonData)
          : null;
        return { ...item, jsonData: parsed_jsonData };
      }) || []
    );
  }, [data]);

  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else if (axiosError?.response?.data?.message) {
        toast.error(axiosError.response.data.message);
      } else {
        toast.error(axiosError.message || "An error occurred");
      }
    }
  }, [error]);

  return (
    <>
      {isLoading ? (
        <LoadingBox inlineStyling={{ flex: 1 }} />
      ) : (
        <div className={classes.ongoingClassBox}>
          {parsedData && parsedData?.length > 0 ? (
            <div className={classes.innerBox}>
              {parsedData?.map((classItem: any, index: number) => {
                const { jsonData } = classItem;

                return (
                  <Card
                    key={`interview-${index}-${classItem?.id || index}`} // Better key
                    time={jsonData?.interviewDate || "Unknown Time"}
                    name={
                      `${jsonData?.firstName} ${jsonData?.lastName}` ||
                      "Unknown Name"
                    }
                    profileImageUrl={
                      jsonData?.profileImage ||
                      "/assets/images/default-avatar.png"
                    }
                    meet_link={jsonData?.meetLink || "No Link Provided"}
                  />
                );
              })}
            </div>
          ) : (
            <div className={classes.errorBox}>
              <div className={classes.imageBox}>
                <Image
                  src="/assets/svgs/boy.svg"
                  alt="No tutor interviews"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <p className={classes.imageText}>
                There are no tutor interviews at the moment...
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TutorInterviews;
