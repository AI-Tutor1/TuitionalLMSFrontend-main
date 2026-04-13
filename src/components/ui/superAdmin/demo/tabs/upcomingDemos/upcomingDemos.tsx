import React from "react";
import classes from "./upcomingDemos.module.css";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import UpcomingDemoCards from "./upcomingDemoCards/upcomingDemoCards";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { GetAllDemos_Api_Params_Type } from "@/types/demo/getAllDemos.types";
import { getAllDemos } from "@/services/dashboard/superAdmin/demo/demo";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { deleteDemo } from "@/services/dashboard/superAdmin/demo/demo";
import { useMutation } from "@tanstack/react-query";
import { MyAxiosError } from "@/services/error.type";
import { toast } from "react-toastify";
import ErrorBox from "@/components/global/error-box/error-box";
import UpdateDemoModal from "@/components/ui/superAdmin/demo/demoUpdate-modal/demoUpdate-modal";
import { updateDemo } from "@/services/dashboard/superAdmin/demo/demo";
import { Create_Demo_Payload_Type } from "@/types/demo/createDemo.types";

interface UpcomingDemosProps {
  handleFeedbackModalOpen: () => void;
}

const UpcomingDemos = ({ handleFeedbackModalOpen }: UpcomingDemosProps) => {
  const { token } = useAppSelector((state) => state.user);
  const [updateModal, setUpdateModal] = React.useState<{
    open: boolean;
    updateData: any;
  }>({
    open: false,
    updateData: null,
  });

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["getAllDemos"],
    queryFn: () => getAllDemos({} as GetAllDemos_Api_Params_Type, { token }),
    staleTime: 60000,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const handleCreateDemo = useMutation({
    mutationFn: (id: string) =>
      deleteDemo(id, {
        token,
      }),
    onSuccess: (data: any) => {
      refetch();
      if (data.message) {
        return toast.success(data.message);
      }
      toast.success("Demo Created Successfully");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? `${axiosError?.response?.data?.message}`
            : axiosError?.response?.data?.error
            ? `${axiosError?.response?.data?.error}`
            : `${axiosError?.response?.status} ${axiosError?.response?.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleUpdateDemo = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Create_Demo_Payload_Type;
    }) =>
      updateDemo(id, payload, {
        token,
      }),
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Demo Updated Successfully");
      }
      refetch();
      setUpdateModal({ open: false, updateData: null });
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? `${axiosError?.response?.data?.message}`
            : axiosError?.response?.data?.error
            ? `${axiosError?.response?.data?.error}`
            : `${axiosError?.response?.status} ${axiosError?.response?.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  return (
    <>
      <div className={classes.container}>
        <div className={classes.header}>
          <div>
            <span>
              <CalendarTodayOutlinedIcon
                sx={{ width: "2rem", height: "2rem" }}
              />
            </span>
            <p>Upcoming Google Meet Demo Sessions</p>
          </div>
          <p>
            View all scheduled demo sessions and collect feedback after
            completion
          </p>
        </div>
        {isLoading ? (
          <LoadingBox inlineStyling={{ height: "500px" }} />
        ) : error ? (
          <ErrorBox />
        ) : (
          <div className={classes.cardsDiv}>
            {data?.data?.map((demo) => (
              <UpcomingDemoCards
                key={demo.id}
                handleFeedbackModalOpen={handleFeedbackModalOpen}
                data={demo}
                handleDeleteDemo={(id: string) => {
                  handleCreateDemo.mutate(id);
                }}
                handleUpdateDemo={(data: any) => {
                  setUpdateModal({ open: true, updateData: data });
                }}
                deleteLoading={handleCreateDemo.isPending}
              />
            ))}
          </div>
        )}
      </div>
      <UpdateDemoModal
        modalOpen={updateModal?.open}
        handleClose={() => setUpdateModal({ open: false, updateData: null })}
        heading="Update Demo"
        subHeading="Update the details of the demo session"
        data={updateModal?.updateData}
        handleUpdate={(data: any) =>
          handleUpdateDemo.mutate({
            id: updateModal?.updateData?.id,
            payload: { ...data },
          })
        }
        loading={handleUpdateDemo.isPending}
      />
    </>
  );
};

export default UpcomingDemos;
