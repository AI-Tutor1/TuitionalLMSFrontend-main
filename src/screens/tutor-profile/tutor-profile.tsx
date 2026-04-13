"use client";
import React, { useMemo, useEffect } from "react";
import styles from "./tutor-profile.module.css";
import Section1 from "./section1/section1";
import Section2 from "./section2/section2";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { getSingleRequest } from "@/services/dashboard/superAdmin/tutor-request/tutor-request";
import { useParams } from "next/navigation";
import { MyAxiosError } from "@/services/error.type";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";

const TutrProfileForm: React.FC = () => {
  const { id } = useParams();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["tutor-profile", id],
    queryFn: () => getSingleRequest(id as string, {}),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const parsedData = useMemo(() => {
    if (!data) return null;
    const { jsonData, ...rest } = data;
    const parsed_jsonData = jsonData ? JSON.parse(jsonData) : null;
    return { ...rest, parsed_jsonData };
  }, [data]);

  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error(axiosError.message);
      }
    }
  }, [error]);

  return (
    <>
      {isLoading ? (
        <LoadingBox />
      ) : data ? (
        <div className={styles.main}>
          <Section1 data={parsedData} refetch={refetch} />
          <Section2 userData={parsedData} />
        </div>
      ) : (
        <ErrorBox />
      )}
    </>
  );
};

export default TutrProfileForm;
