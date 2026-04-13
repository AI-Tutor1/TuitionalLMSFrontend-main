import React, { useState, useCallback, memo } from "react";
import Tabs from "@/components/global/tabs/tabs";
import SearchBox from "@/components/global/search-box/search-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import styles from "./curriculum.module.css";
import Button from "@/components/global/button/button";
import AddModal from "@/components/ui/superAdmin/resources/add-modal/add-modal";
import DeleteModal from "@/components/ui/superAdmin/resources/delete-modal/delete-modal";
import EditModal from "@/components/ui/superAdmin/resources/edit-modal/edit-modal";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Board from "./tabs-view/board/board";
import Grade from "./tabs-view/grades/grades";
import Curriculum from "./tabs-view/curriculum/curriculum";
import Subject from "./tabs-view/subject/subject";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllCurriculums,
  deleteSubject,
  addField,
  updateField,
} from "@/services/dashboard/superAdmin/curriulums/curriulums";
import { MyAxiosError } from "@/services/error.type";
import { toast } from "react-toastify";
import { BASE_URL } from "@/services/config";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { Grid, Box } from "@mui/material";

const tabsArray = ["Boards", "Grades", "Curriculums", "Subjects"];

const CurriculumForm: React.FC = () => {
  // States
  const token = useAppSelector((state: any) => state?.user?.token);
  const [activeTab, setActiveTab] = useState<string>("Boards");
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // general functions
  const changeTab = useCallback((tab: string) => setActiveTab(tab), []);
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  }, []);

  const filteredData = useCallback(
    (data: any) =>
      data?.filter((item: any) =>
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  // Modal functions
  const handleAddModalToggle = useCallback(() => {
    setAddModalOpen((prev) => {
      return !prev;
    });
  }, []);
  const handleDeleteModalToggle = useCallback((id: any) => {
    setDeleteModalOpen(true);
    setDeleteId(id);
  }, []);
  const handleUpdateModalToggle = useCallback((id: any) => {
    setEditModalOpen(true);
    setUpdateId(id);
  }, []);

  // Submission functions
  const handleAddResource = useCallback((resource: any) => {
    addResource.mutate({ name: resource });
  }, []);
  const handleEditResource = useCallback(
    (editResourse: any) => {
      editResource.mutate({
        id: updateId?.toString(),
        name: editResourse,
        status: "true",
      });
    },
    [updateId],
  );
  const handleDeleteResource = useCallback(() => {
    deleteResource.mutate(deleteId ? deleteId : "");
  }, [deleteId]);

  // API handlers
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: () => getAllCurriculums({ token }),
  });
  const addResource = useMutation({
    mutationFn: (payload: any) =>
      addField(payload, `${BASE_URL}/api/${activeTab.toLowerCase()}`, {
        token,
      }),
    onSuccess: () => {
      setAddModalOpen(false);
      toast.success(`${activeTab} Added Successfully`);
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });
  const editResource = useMutation({
    mutationFn: (payload: {
      id: string | undefined;
      name: string;
      status: string;
    }) =>
      updateField(
        { name: payload.name, status: payload.status },
        `${BASE_URL}/api/${activeTab.toLowerCase()}/${payload.id}`,
        {
          token,
        },
      ),
    onSuccess: () => {
      setEditModalOpen(false);
      toast.success(`${activeTab} Updated Successfully`);
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });
  const deleteResource = useMutation({
    mutationFn: (id: any) =>
      deleteSubject(`${BASE_URL}/api/${activeTab.toLowerCase()}/${id}`, {
        token,
      }),
    onSuccess: () => {
      setDeleteModalOpen(false);
      setDeleteId(null);
      toast.success(
        `${
          activeTab.endsWith("s") ? activeTab.slice(0, -1) : activeTab
        } Deleted Successfully`,
      );
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  // Error handling
  if (error) {
    const axiosError = error as MyAxiosError;
    return (
      <ErrorBox
        inlineStyling={{ flex: 1 }}
        message={
          axiosError.response
            ? axiosError.response.data.error ||
              `${axiosError.response.status} ${axiosError.response.statusText}`
            : axiosError.message
        }
      />
    );
  }

  return (
    <>
      <main className={styles.container}>
        <div className={styles.main}>
          <Tabs
            tabsArray={tabsArray}
            activeTab={activeTab}
            handleTabChange={changeTab}
            inlineTabsStyles={{
              minWidth: "320px",
            }}
          />
          <div className={styles.filter}>
            <SearchBox
              placeholder="Search any resource"
              changeFn={handleSearch}
              inlineStyles={{ minWidth: "320px" }}
            />
            <Button
              text="Add New"
              icon={<AddOutlinedIcon />}
              clickFn={handleAddModalToggle}
              inlineStyling={{ width: "120px" }}
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingBox inlineStyling={{ flex: 1 }} />
        ) : error ? (
          <ErrorBox inlineStyling={{ flex: 1 }} />
        ) : (
          (() => {
            const { curriculum, board, subject, grades } = data || {};
            return (
              <div className={styles.mainContent}>
                {activeTab === "Boards" && (
                  <Board
                    data={filteredData(board)}
                    deleteModalToggle={handleDeleteModalToggle}
                    updateModalToggle={handleUpdateModalToggle}
                  />
                )}
                {activeTab === "Grades" && (
                  <Grade
                    data={filteredData(grades)}
                    deleteModalToggle={handleDeleteModalToggle}
                    updateModalToggle={handleUpdateModalToggle}
                  />
                )}
                {activeTab === "Curriculums" && (
                  <Curriculum
                    data={filteredData(curriculum)}
                    deleteModalToggle={handleDeleteModalToggle}
                    updateModalToggle={handleUpdateModalToggle}
                  />
                )}
                {activeTab === "Subjects" && (
                  <Subject
                    data={filteredData(subject)}
                    deleteModalToggle={handleDeleteModalToggle}
                    updateModalToggle={handleUpdateModalToggle}
                  />
                )}
              </div>
            );
          })()
        )}
      </main>

      {deleteModalOpen && deleteId !== null && (
        <DeleteModal
          loading={deleteResource?.isPending}
          modalOpen={deleteModalOpen}
          handleClose={() => {
            setDeleteModalOpen(false);
            setDeleteId(null);
          }}
          heading={`Are You Sure?`}
          subHeading={
            "This action cannot be undone. All values associated with this field will be lost."
          }
          handleDelete={handleDeleteResource}
        />
      )}

      <AddModal
        loading={addResource?.isPending}
        modalOpen={addModalOpen}
        handleClose={handleAddModalToggle}
        heading={`Add ${activeTab}`}
        subHeading={`Fill out the form in order to create the ${activeTab}`}
        activeTab={activeTab}
        handleAdd={handleAddResource}
      />

      <EditModal
        loading={editResource?.isPending}
        modalOpen={editModalOpen}
        handleClose={() => setEditModalOpen(false)}
        heading={`Update ${activeTab}`}
        subHeading={`Fill out the form in order to update the ${activeTab}`}
        activeTab={activeTab}
        handleEdit={handleEditResource}
      />
    </>
  );
};

export default CurriculumForm;
