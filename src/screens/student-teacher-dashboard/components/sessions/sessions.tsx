import React, { FC, useEffect, useCallback, memo } from "react";
import styles from "./sessions.module.css";
import Button from "@/components/global/button/button";
import Card from "./components/card/card";
import { getAllSessionWithGroupIds } from "@/services/dashboard/superAdmin/sessions/sessions";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { useRouter } from "next/navigation";

const Sessions: FC = () => {
  const router = useRouter();
  const { enrollementIds, token, user } = useAppSelector(
    (state: any) => state?.user || {},
  );

  const handleViewAll = useCallback(() => {
    router.push(
      `/${
        user?.roleId === 3
          ? "student"
          : user?.roleId === 4
            ? "parent"
            : "teacher"
      }/sessions`,
    );
  }, [user?.roleId, router]);

  const getPayload = useCallback(() => {
    if (user?.roleId === 3 && enrollementIds?.length > 0) {
      return { enrollment_id: [...enrollementIds].join(",") };
    } else if (user?.roleId === 5 && String(user?.id)) {
      return { tutor_id: String(user.id) };
    } else if (user?.roleId === 4 && String(user?.id)) {
      return { enrollment_id: [...enrollementIds].join(",") };
    }
    return null;
  }, [user?.roleId, user?.id, enrollementIds]);

  const { data, error, isLoading } = useQuery({
    queryKey: ["sessions", user?.roleId, user?.id, enrollementIds],
    queryFn: () => {
      const payload = getPayload();
      if (!payload) return null;
      return getAllSessionWithGroupIds({ token }, payload);
    },
    enabled: !!user?.roleId && !!user?.id && !!enrollementIds,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

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
    <div className={styles.sessionsBox}>
      <div className={styles.heading}>
        Sessions
        <Button
          text="View All"
          inlineStyling={{
            height: "max-content",
            maxHeight: "max-content",
            minHeight: "max-content",
            width: "max-content",
          }}
          clickFn={handleViewAll}
        />
      </div>
      {isLoading ? (
        <LoadingBox />
      ) : !data || error || data?.data?.length === 0 ? (
        <ErrorBox />
      ) : (
        <div className={styles.innerBox}>
          {data?.data?.map((classItem: any, index: number) => (
            <Card
              key={classItem?.id}
              role={
                user?.roleId === 3
                  ? "student"
                  : user.roleId === 4
                    ? "parent"
                    : "teacher"
              }
              {...(user?.roleId === 5 || user?.roleId === 4
                ? {
                    expectedStudents:
                      classItem?.ClassSchedule?.enrollment?.studentsGroups ||
                      classItem?.students ||
                      [] ||
                      [],
                  }
                : {})}
              {...(user?.roleId === 3 || user.roleId === 4
                ? { tutor: classItem?.tutor }
                : {})}
              subject={
                classItem?.ClassSchedule?.enrollment?.subject?.name ||
                classItem?.sessionEnrollment?.subject?.name ||
                "No Show"
              }
              time={classItem?.created_at || "No Show"}
              status={classItem?.conclusion_type || "No Show"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(Sessions);
