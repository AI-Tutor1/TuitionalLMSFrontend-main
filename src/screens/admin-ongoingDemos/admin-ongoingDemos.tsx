import React from "react";
import classes from "./admin-ongoingDemos.module.css";
import Card from "./components/card/card";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { GetAllDemos_Api_Params_Type } from "@/types/demo/getAllDemos.types";
import { getAllDemos } from "@/services/dashboard/superAdmin/demo/demo";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import moment from "moment";
import Image from "next/image";

const AdminOngoingClasses = () => {
  const { token } = useAppSelector((state) => state.user);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["getAllDemos"],
    queryFn: () =>
      getAllDemos(
        {
          date: moment().startOf("day").format("YYYY-MM-DD"),
        } as GetAllDemos_Api_Params_Type,
        { token },
      ),
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {isLoading ? (
        <LoadingBox />
      ) : error ? (
        <ErrorBox />
      ) : data?.data && data?.data?.length === 0 ? (
        <div className={classes.errorBox}>
          <div className={classes.imageBox}>
            <Image
              src="/assets/svgs/boy.svg"
              alt="No ongoing class"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <p className={classes.imageText}>
            There are no classes ongoing at the moment...
          </p>
        </div>
      ) : (
        <div className={classes.cardsContainer}>
          {data?.data?.map((demo: any, index: number) => {
            const { enrollment_reschedual, enrollment } = demo;
            return (
              <Card
                key={demo.id}
                time={demo.time}
                date={demo.date}
                duration={demo.duration}
                name={demo.demoTutor.name}
                profileImageUrl={demo.demoTutor.profileImageUrl}
                meet_link={demo.meetLink}
                student={demo.studentName}
                subject={demo?.demoSubject?.name}
                grade={demo?.demoGrade?.name}
                curriculum={demo?.demoCurriculum?.name}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default AdminOngoingClasses;
