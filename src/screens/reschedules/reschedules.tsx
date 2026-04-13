import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import classes from "./reschedules.module.css";
import { useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { rescheduleRequest } from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id";
import dynamic from "next/dynamic";
import ListView from "@/components/ui/superAdmin/reschedules/list-view/list-view";
import CalenderView from "@/components/ui/superAdmin/reschedules/calender-view/calender-view";
import ErrorBox from "@/components/global/error-box/error-box";
const Tabs = dynamic(() => import("@/components/global/tabs/tabs"));
import LoadingBox from "@/components/global/loading-box/loading-box";

const dayOrder: { [key: string]: number } = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const Reschedules: FC = () => {
  const { token } = useAppSelector((state) => state?.user);
  const tabsArray = useMemo(() => ["Calender View", "Time View"], []);
  const [activeTab, setActiveTab] = useState(tabsArray[0]);
  const [refactoredData, setRefactoredData] = useState<any[]>([]); // ✅ Store processed data

  const handleRescheduleRequest = useMutation({
    mutationFn: () =>
      rescheduleRequest(
        {},
        {
          token,
        },
        {}
      ),
    onSuccess: (data) => {
      // toast.success("Reschedule Request Fetched Successfully");
      const transformedData = refactoredSchedules(data); // ✅ Process data
      setRefactoredData(transformedData); // ✅ Store in state
    },
    onError: (error: MyAxiosError) => {
      if (error.response) {
        toast.error(
          error.response.data.error ||
            `${error.response.status} ${error.response.statusText}`
        );
      } else {
        toast.error(error.message);
      }
    },
  });

  const refactoredSchedules = useCallback((data: any) => {
    const groupedByDay = data?.reduce((acc: any, item: any) => {
      if (!item.DateTime) return acc; // ✅ Skip items with null/undefined/false DateTime

      const localTime = moment.utc(item.DateTime).local(); // ✅ Convert UTC to Local
      const day = localTime.format("dddd"); // Get the day name
      const date = localTime.format("DD-MM-YYYY"); // Format the date

      if (!acc[day]) {
        acc[day] = { day, date, slots: [] };
      }

      // Push the item into the slots array
      acc[day].slots.push({ ...item });

      // Sort the slots array based on DateTime
      acc[day].slots.sort((a: any, b: any) => {
        return (
          moment.utc(a.DateTime).local().valueOf() -
          moment.utc(b.DateTime).local().valueOf()
        );
      });

      return acc;
    }, {});

    // Convert to an array
    const sortedSchedules = Object.values(groupedByDay);

    // Sort the days
    sortedSchedules.sort((a: any, b: any) => dayOrder[a.day] - dayOrder[b.day]);

    return sortedSchedules;
  }, []);

  useEffect(() => {
    if (token) {
      handleRescheduleRequest?.mutate();
    }
  }, [token]);

  return (
    <main className={classes.container}>
      <div className={classes.section1}>
        <Tabs
          tabsArray={tabsArray}
          activeTab={activeTab}
          handleTabChange={setActiveTab}
          inlineTabsStyles={styles.tabsStyles}
        />
      </div>

      {handleRescheduleRequest.isPending ? (
        <LoadingBox />
      ) : activeTab === "Calender View" ? (
        refactoredData ? (
          <CalenderView reschedules={refactoredData} />
        ) : (
          <ErrorBox />
        )
      ) : refactoredData ? (
        <ListView reschedules={refactoredData} />
      ) : (
        <ErrorBox />
      )}
    </main>
  );
};

export default Reschedules;

const styles = {
  tabsStyles: { width: "30%", height: "100%" },
};
