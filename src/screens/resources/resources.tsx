import React, { useCallback, useState, useMemo } from "react";
import classes from "./resources.module.css";
import Tabs from "@/components/global/tabs/tabs";
import Button from "@/components/global/button/button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import NoteCard from "@/components/ui/superAdmin/notes/noteCard/noteCard";
import AddNotesModal from "@/components/ui/superAdmin/notes/add-modal/add-modal";
import EditNotesModal from "@/components/ui/superAdmin/notes/edit-modal/edit-modal";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllResources,
  addResource,
  updateResource,
  deleteResource,
  addLikeToResource,
  downloadResource,
} from "@/services/dashboard/superAdmin/resources/resources";
import {
  ResourcesResponse,
  AddResourcePayload,
  AddResourceResponse,
  editResourcePayload,
  Resource,
} from "@/types/resources/resources.types";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import PaginationComponent from "@/components/global/pagination/pagination";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import SearchBox from "@/components/global/search-box/search-box";
import useDebounce from "@/utils/helpers/useDebounce";
import { useParams } from "next/navigation";
import DeleteModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";

const tabsArray = ["All Notes", "My Notes"];

const Resources = () => {
  const { role } = useParams();
  const { token, user } = useAppSelector((state: any) => state?.user);
  const [activeTab, setActiveTab] = useState<string>(tabsArray[0]);
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<{
    open: boolean;
    resource: Resource | null;
  }>({ open: false, resource: null });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  // pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [debouncedSearchItem, setDebouncedSearchItem] = useState<string>("");
  const debouncedSearch = useDebounce(debouncedSearchItem, 1500);

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleChangePage = useCallback((e: any, newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleSearch = useCallback((e: any) => {
    const enrollmentSearch = e.target.value;
    setDebouncedSearchItem(enrollmentSearch);
  }, []);

  const handleAddModalOpen = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleAddModalClose = useCallback(() => {
    setAddModalOpen(false);
  }, []);

  const handleEditModalOpen = useCallback((editResource: any) => {
    setEditModalOpen({ open: true, resource: editResource });
  }, []);

  const handleEditModalClose = useCallback(() => {
    setEditModalOpen({ open: false, resource: null });
  }, []);

  const handleChangeRowsPerPage = useCallback((e: any) => {
    setRowsPerPage(e?.target?.value);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setDeleteModal({ open: false, id: null });
  }, []);

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: { width: "max-content", alignSelf: "flex-end" },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  const {
    data: resourcesResponse,
    error: resourcesError,
    isLoading: resourcesLoading,
    refetch,
  } = useQuery<ResourcesResponse>({
    queryKey: ["getAllResources", rowsPerPage, currentPage, debouncedSearch],
    queryFn: () =>
      getAllResources(
        {
          limit: String(rowsPerPage),
          page: String(currentPage),
          search: debouncedSearch,
        },
        { token },
      ),
    staleTime: 60000,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const addResourceMutation = useMutation({
    mutationFn: (payload: AddResourcePayload) =>
      addResource(payload, { token }),
    onSuccess: (data: AddResourceResponse) => {
      toast.success(data.success || "Resource created Successfully");
      refetch();
      setAddModalOpen(false);
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create resource";
      toast.error(errorMessage);
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: (payload: editResourcePayload & { id: number | null }) =>
      updateResource(payload.id, payload, { token }),
    onSuccess: (data: any) => {
      toast.success(data.message || "Resource updated Successfully");
      setEditModalOpen({ open: false, resource: null });
      refetch();
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update resource";
      toast.error(errorMessage);
    },
  });

  // Add like mutation
  const likeResourceMutation = useMutation({
    mutationFn: (likeId: number) => addLikeToResource(likeId, { token }),
    onSuccess: (data: any) => {
      toast.success(data.success || "Resource liked successfully.");
      refetch();
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update resource";
      toast.error(errorMessage);
    },
  });

  // Add view mutation
  const downloadResourceMutation = useMutation({
    mutationFn: (downloadId: number) => downloadResource(downloadId, { token }),
    onSuccess: async (data: { resourceLink?: string; success?: string }) => {
      if (!data?.resourceLink) {
        toast.error("Download link not found");
        return refetch();
      }
      try {
        const link = document.createElement("a");
        link.href = data.resourceLink;
        link.target = "_blank";
        link.download = data.resourceLink.split("/").pop() || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(data.success || "Downloaded successfully");
      } catch {
        toast.error("Failed to download");
      } finally {
        refetch();
      }
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to download resource";
      toast.error(errorMessage);
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: (deleteId: number | null) =>
      deleteResource(deleteId, { token }),
    onSuccess: (data: any) => {
      toast.success(data.message || "Resource deleted Successfully");
      refetch();
      setDeleteModal({ open: false, id: null });
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete resource";
      toast.error(errorMessage);
    },
  });

  const addNotesButtonProps = useMemo(
    () => ({
      text: "Add Notes",
      icon: <AddOutlinedIcon />,
      clickFn: handleAddModalOpen,
      inlineStyling: { width: "max-content" },
    }),
    [handleAddModalOpen],
  );

  const tabsProps = useMemo(
    () => ({
      tabsArray,
      activeTab,
      handleTabChange,
      inlineTabsStyles: {},
      buttonWidth: "max-content",
    }),
    [activeTab, handleTabChange],
  );

  const searchBoxProps = useMemo(
    () => ({
      placeholder: "Search name",
      changeFn: handleSearch,
      value: debouncedSearchItem,
      inlineStyles: {
        ...styles.searchBoxStyles,
      },
    }),
    [handleSearch, debouncedSearchItem],
  );

  const addNotesModalConfig = useMemo(
    () => ({
      heading: "Add Resource",
      subHeading: "Fill out the form in order to add a new resource",
      modalOpen: addModalOpen,
      handleAdd: (payload: {
        title: string;
        description: string;
        resourceLink: string;
      }) => {
        addResourceMutation.mutate(payload);
      },
      loading: addResourceMutation.isPending,
      success: addResourceMutation.isSuccess,
      handleClose: handleAddModalClose,
    }),
    [
      addModalOpen,
      handleAddModalClose,
      addResourceMutation.isPending,
      addResourceMutation.isSuccess,
    ],
  );

  const editNotesModalConfig = useMemo(
    () => ({
      heading: "Edit Resource",
      subHeading: "Fill out the form in order to edit a resource",
      modalOpen: editModalOpen,
      handleEdit: (payload: editResourcePayload & { id: number | null }) => {
        updateResourceMutation.mutate(payload);
      },
      loading: updateResourceMutation.isPending,
      success: updateResourceMutation.isSuccess,
      handleClose: handleEditModalClose,
    }),
    [
      editModalOpen,
      handleEditModalClose,
      updateResourceMutation.isPending,
      updateResourceMutation.isSuccess,
    ],
  );

  const deleteModalProps = useMemo(
    () => ({
      modalOpen: deleteModal.open,
      handleClose: handleDeleteModalClose,
      subHeading:
        "Are you sure you want to delete this enrollment? This action is permanent.",
      heading: "Are You Sure?",
      handleDelete: () => deleteResourceMutation.mutate(deleteModal.id),
      loading: deleteResourceMutation.isPending,
    }),
    [deleteModal, handleDeleteModalClose, deleteResourceMutation.isPending],
  );

  return (
    <div className={classes.container}>
      <div className={classes.actions}>
        <MobileFilterButton {...mobileFilterButtonProps} />
        {role !== "student" && <Button {...addNotesButtonProps} />}
        <Tabs {...tabsProps} />
      </div>
      {showFullFilters && (
        <div className={classes.filtersContainer}>
          <SearchBox {...searchBoxProps} />
        </div>
      )}
      {resourcesLoading ? (
        <LoadingBox inlineStyling={{}} />
      ) : resourcesError ||
        !resourcesResponse?.data ||
        resourcesResponse?.data?.length === 0 ? (
        <ErrorBox />
      ) : (
        <div className={classes.contentBox}>
          {resourcesResponse?.data?.map((resource: any) => (
            <NoteCard
              key={resource.id}
              resource={resource}
              handleDeleteModal={(deleteId: number) =>
                setDeleteModal({
                  open: true,
                  id: deleteId,
                })
              }
              handleEditModal={(editResource: Resource) =>
                handleEditModalOpen(editResource)
              }
              handleLikes={(likeId: number) =>
                likeResourceMutation.mutate(likeId)
              }
              handleDownloads={(downloadId: number) =>
                downloadResourceMutation.mutate(downloadId)
              }
              likeLoading={likeResourceMutation.isPending}
              likeSuccess={likeResourceMutation.isSuccess}
              downloadLoading={downloadResourceMutation.isPending}
              downloadSuccess={downloadResourceMutation.isSuccess}
            />
          ))}
        </div>
      )}
      <PaginationComponent
        totalPages={resourcesResponse?.totalPages}
        page={resourcesResponse?.currentPage || 0}
        totalEntries={resourcesResponse?.totalCount || 0}
        rowsPerPage={rowsPerPage || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 100, 200]}
      />
      <AddNotesModal {...addNotesModalConfig} />
      <EditNotesModal {...editNotesModalConfig} />
      <DeleteModal {...deleteModalProps} />
    </div>
  );
};

export default Resources;

const styles = {
  searchBoxStyles: {
    minWidth: "320px",
    flex: "1",
    background: "var(--main-white-color)",
  },
};
