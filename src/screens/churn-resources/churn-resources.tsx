import React, { useState, useCallback, useMemo, useEffect } from "react";
import classes from "./churn-resources.module.css";
import Tabs from "@/components/global/tabs/tabs";
import Button from "@/components/global/button/button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AddModal from "@/components/ui/superAdmin/churn-resources/add-modal/add-modal";
import EditModal from "@/components/ui/superAdmin/churn-resources/edit-modal/edit-modal";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import {
  createNewChurnQuestion,
  createNewChurnReason,
  getAllChurnReasons,
  getAllChurnQuestions,
  deleteChurnReason,
  deleteChurnQuestion,
  editChurnReason,
  editChurnQuestion,
} from "@/services/dashboard/superAdmin/churn-resources/churn-resources";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import Image from "next/image";
import { Tooltip } from "@mui/material";

const TABS_ARRAY = ["Questions", "Reasons"];
const TABS_INLINE_STYLES = { width: "40%" };

const ChurnResources = () => {
  const token = useAppSelector((state: any) => state?.user?.token);
  const [activeTab, setActiveTab] = useState<string>(TABS_ARRAY[0]);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<{
    open: boolean;
    item: any;
  }>({
    open: false,
    item: null,
  });
  const [deleteChurnResourceId, setDeleteChurnResourceId] = useState<
    number | null
  >(null);

  const changeTab = useCallback((tab: string) => setActiveTab(tab), []);

  const handleAddModalToggle = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setAddModalOpen(false);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setEditModalOpen({
      open: false,
      item: null,
    });
  }, []);

  // Fetch Churn Reasons
  const {
    data: allChurnReasons,
    error: allChurnReasonsError,
    isLoading: allChurnReasonsLoading,
    refetch: allChurnReasonsRefetch,
  } = useQuery({
    queryKey: ["getAllChurnReasons"],
    queryFn: () => getAllChurnReasons({ token }),
    refetchOnWindowFocus: false,
    staleTime: 300000,
    enabled: !!token,
  });

  // Fetch Churn Questions
  const {
    data: allChurnQuestions,
    error: allChurnQuestionsError,
    isLoading: allChurnQuestionsLoading,
    refetch: allChurnQuestionsRefetch,
  } = useQuery({
    queryKey: ["getAllChurnQuestions"],
    queryFn: () => getAllChurnQuestions({ token }),
    refetchOnWindowFocus: false,
    staleTime: 300000,
    enabled: !!token,
  });

  // Add Churn Resource Mutation
  const addChurnResource = useMutation({
    mutationFn: (payload: {
      reason?: string;
      question?: string;
      category?: string;
    }) => {
      if (activeTab === "Reasons") {
        return createNewChurnReason({ token }, payload);
      } else {
        return createNewChurnQuestion({ token }, payload);
      }
    },
    onSuccess: () => {
      setAddModalOpen(false);
      toast.success(`${activeTab.slice(0, -1)} Added Successfully`);
      if (activeTab === "Reasons") {
        allChurnReasonsRefetch();
      } else {
        allChurnQuestionsRefetch();
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const editChurnResource = useMutation({
    mutationFn: (payload: {
      reason?: string;
      question?: string;
      category?: string;
    }) => {
      if (activeTab === "Reasons") {
        return editChurnReason(editModalOpen?.item?.id, { token }, payload);
      } else {
        return editChurnQuestion(editModalOpen?.item?.id, { token }, payload);
      }
    },
    onSuccess: () => {
      setEditModalOpen({
        open: false,
        item: null,
      });
      toast.success(`${activeTab.slice(0, -1)} edit successfully`);
      if (activeTab === "Reasons") {
        allChurnReasonsRefetch();
      } else {
        allChurnQuestionsRefetch();
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const deleteChurnResource = useMutation({
    mutationFn: (id: number) => {
      if (activeTab === "Reasons") {
        return deleteChurnReason(id, { token });
      } else {
        return deleteChurnQuestion(id, { token });
      }
    },
    onSuccess: () => {
      setAddModalOpen(false);
      toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
      if (activeTab === "Reasons") {
        allChurnReasonsRefetch();
      } else {
        allChurnQuestionsRefetch();
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  // Memoized computed values
  const buttonText = useMemo(
    () => `Add New Churn ${activeTab.slice(0, -1)}`,
    [activeTab]
  );

  const modalHeading = useMemo(
    () => `Add ${activeTab.slice(0, -1)}`,
    [activeTab]
  );

  const editModalHeading = useMemo(
    () => `Edit${activeTab.slice(0, -1)}`,
    [activeTab]
  );
  const modalSubHeading = useMemo(
    () =>
      `Fill out the form in order to create the churn ${activeTab.toLowerCase()}`,
    [activeTab]
  );
  const editModalSubHeading = useMemo(
    () =>
      `Fill out the form in order to edit the churn ${activeTab.toLowerCase()}`,
    [activeTab]
  );
  // Group reasons by category
  const groupedReasons = useMemo(() => {
    if (activeTab !== "Reasons" || !allChurnReasons) return {};

    return allChurnReasons.reduce((acc: any, item: any) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [activeTab, allChurnReasons]);

  // Display data based on active tab
  const displayData = useMemo(() => {
    if (activeTab === "Questions") {
      return allChurnQuestions || [];
    }
    return allChurnReasons || [];
  }, [activeTab, allChurnQuestions, allChurnReasons]);

  const isLoading = useMemo(
    () =>
      activeTab === "Questions"
        ? allChurnQuestionsLoading
        : allChurnReasonsLoading,
    [activeTab, allChurnQuestionsLoading, allChurnReasonsLoading]
  );

  useEffect(() => {
    if (allChurnQuestionsError || allChurnReasonsError) {
      const axiosError = (allChurnQuestionsError ||
        allChurnReasonsError) as MyAxiosError;
      toast.error(
        axiosError?.response?.data.message ||
          axiosError?.response?.data.error ||
          `${axiosError?.response?.status} ${axiosError?.response?.statusText}` ||
          "An unexpected error occured"
      );
    }
  }, [allChurnQuestionsError, allChurnReasonsError]);

  const renderDeleteButton = (item: any) => (
    <Tooltip title={`Delete ${activeTab}`} arrow>
      <span
        className={classes.iconBox}
        onClick={(e) => {
          e.stopPropagation();
          deleteChurnResource.mutate(item.id);
          setDeleteChurnResourceId(item.id);
        }}
      >
        {deleteChurnResource.isPending && deleteChurnResourceId === item.id ? (
          <LoadingBox
            loaderStyling={{
              width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem) !important",
              height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem) !important",
            }}
          />
        ) : (
          <Image
            src="/assets/svgs/delete.svg"
            alt="delete"
            width={0}
            height={0}
            style={{
              width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
              height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            }}
          />
        )}
      </span>
    </Tooltip>
  );

  const renderEditButton = (item: any) => (
    <Tooltip title={`Edit ${activeTab}`} arrow>
      <span
        className={classes.iconBox}
        onClick={(e) => {
          e.stopPropagation();
          setEditModalOpen({ open: true, item: item });
          // editChurnResource.mutate(item.id);
          // setEditChurnResourceId(item.id);
        }}
      >
        <Image
          src="/assets/svgs/edit.svg"
          alt="delete"
          width={0}
          height={0}
          style={{
            width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
          }}
        />
      </span>
    </Tooltip>
  );

  return (
    <div className={classes.container}>
      <div className={classes.section1}>
        <Tabs
          inlineTabsStyles={TABS_INLINE_STYLES}
          tabsArray={TABS_ARRAY}
          activeTab={activeTab}
          handleTabChange={changeTab}
        />
        <Button
          text={buttonText}
          icon={<AddOutlinedIcon />}
          clickFn={handleAddModalToggle}
        />
      </div>

      <div className={classes.mainContent}>
        {isLoading ? (
          <LoadingBox />
        ) : displayData.length === 0 ? (
          <ErrorBox />
        ) : activeTab === "Reasons" ? (
          // Grouped view for Reasons
          <div className={classes.groupedContainer}>
            {Object.entries(groupedReasons).map(
              ([category, items]: [string, any]) => (
                <div key={category} className={classes.categoryGroup}>
                  <h4 className={classes.categoryTitle}>{category}</h4>
                  <ol className={classes.mainBox}>
                    {items.map((item: any, index: number) => (
                      <li key={item.id || index}>
                        <span>{index + 1}. </span>
                        {item.reason}
                        {renderEditButton(item)}
                        {renderDeleteButton(item)}
                      </li>
                    ))}
                  </ol>
                </div>
              )
            )}
          </div>
        ) : (
          // Regular list view for Questions
          <ol className={classes.mainBox}>
            {displayData?.map((item: any, index: number) => (
              <li key={item.id || index}>
                <span>{index + 1}. </span>
                {item.question}
                {renderEditButton(item)}
                {renderDeleteButton(item)}
              </li>
            ))}
          </ol>
        )}
      </div>

      <AddModal
        modalOpen={addModalOpen}
        handleClose={handleClose}
        heading={modalHeading}
        subHeading={modalSubHeading}
        activeTab={activeTab}
        handleAdd={(payload: {
          reason?: string;
          question?: string;
          category?: string;
        }) => addChurnResource.mutate(payload)}
        loading={addChurnResource.isPending}
        isSuccess={addChurnResource.isSuccess}
      />
      <EditModal
        modalOpen={editModalOpen?.open}
        handleClose={handleEditModalClose}
        heading={editModalHeading}
        subHeading={editModalSubHeading}
        activeTab={activeTab}
        item={editModalOpen?.item}
        handleEdit={(payload: {
          reason?: string;
          question?: string;
          category?: string;
        }) => editChurnResource.mutate(payload)}
        loading={editChurnResource.isPending}
        isSuccess={editChurnResource.isSuccess}
      />
    </div>
  );
};

export default ChurnResources;
