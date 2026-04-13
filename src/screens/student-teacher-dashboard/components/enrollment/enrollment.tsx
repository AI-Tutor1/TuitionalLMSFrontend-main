import React, { FC, useCallback, useEffect, memo } from "react";
import classes from "./enrollment.module.css";
import Button from "@/components/global/button/button";
import Card from "./components/card/card";
import { useQuery } from "@tanstack/react-query";
import { getAllEnrollments } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useRouter } from "next/navigation";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";

const Enrollment: FC = () => {
  const router = useRouter();
  const { token, user, childrens } = useAppSelector((state) => state?.user);

  const { data, error, isLoading } = useQuery({
    queryKey: ["enrollments", user?.roleId, user?.id],
    queryFn: () =>
      getAllEnrollments(
        {
          teacher_id: user?.roleId === 5 ? String(user?.id) : "",
          student_id: user?.roleId === 3 ? String(user?.id) : "",
          childrens:
            user?.roleId === 4
              ? childrens?.map((i: any) => i.id).join(",")
              : undefined,
          limit: 10,
          on_break: "",
          is_permanent: "",
        },
        {
          token,
        },
      ),
    enabled: !!user?.id && !!token && !!user?.roleId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const handleViewAll = useCallback(() => {
    router.push(`/${user?.roleId === 3 ? "student" : "teacher"}/enrollments`);
  }, [user?.roleId, router]);

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
    <div className={classes.enrollmentBox}>
      <div className={classes.heading}>
        Enrollments
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
        <LoadingBox
          inlineStyling={{ flex: "0 1 calc(100% - 10px)", minHeight: 0 }}
        />
      ) : (
        <div className={classes.innerBox}>
          {data && data?.data?.length > 0 ? (
            data?.data?.map((classItem: any, index: number) => (
              <Card
                key={index}
                role={
                  user?.roleId === 3
                    ? "student"
                    : user?.roleId === 4
                      ? "parent"
                      : "teacher"
                }
                {...(user?.roleId === 5
                  ? { students: classItem?.studentsGroups || [] }
                  : {})}
                {...(user?.roleId === 3
                  ? { name: classItem?.tutor?.name }
                  : {})}
                {...(user?.roleId === 4
                  ? { name: classItem?.tutor?.name }
                  : {})}
                subject={classItem?.subject?.name}
                board={classItem?.board?.name}
                curriculum={classItem?.curriculum?.name}
                grade={classItem?.grade?.name}
                rate={classItem?.hourly_rate}
                day={classItem?.createdAt}
                profileImageUrl={classItem?.tutor?.profileImageUrl}
                tutorHourlyRate={classItem.tutor_hourly_rate}
              />
            ))
          ) : (
            <ErrorBox />
          )}
        </div>
      )}
    </div>
  );
};

export default memo(Enrollment);
