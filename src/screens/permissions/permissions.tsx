"use client";
import React, { useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import classes from "./permissions.module.css";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole as deleteRoleService,
  assignPagesToRole,
  getAllPagesAssignedToRole,
} from "@/services/dashboard/roles/roles";
import { getAllPages } from "@/services/dashboard/superAdmin/pages/pages";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks/hooks";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import Button from "@/components/global/button/button";
import { Plus } from "lucide-react";
import AddModal from "@/components/ui/superAdmin/role/add-modal/add-Modal";
import UpdateModal from "@/components/ui/superAdmin/role/update-modal/update-modal";
import DeleteModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import AssignPagesToRole from "@/components/ui/superAdmin/role/assignPagesToRole/assignPagesToRole";
import Tabs from "@/components/global/tabs/tabs";
import ToggleButton from "@/components/global/toggle-button/toggle-button";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { fetchAllPagesAssignToUser } from "@/lib/store/slices/assignedPages-slice";
import { fetchRoles } from "@/lib/store/slices/role-slice";

interface EditModalType {
  open: boolean;
  updatedId: number | null;
  name?: string;
}

interface AssignPagesModalType {
  id: number;
  modalOpen: boolean;
}

interface ModalsState {
  addModal: boolean;
  deleteModal: boolean;
  assignPagesModal: AssignPagesModalType | null;
}

// Constants
const QUERY_KEYS = {
  getAllRoles: "getAllRoles",
  getAllPages: "getAllPages",
  getAllPagesAssignedToRole: "getAllPagesAssignedToRole",
} as const;

const Page = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { token, user } = useAppSelector((state) => state?.user);
  // State management
  const [activeRole, setActiveRole] = React.useState<string>("Super Admin");
  const [modals, setModals] = React.useState<ModalsState>({
    addModal: false,
    deleteModal: false,
    assignPagesModal: null,
  });
  const [editModal, setEditModal] = React.useState<EditModalType>({
    updatedId: null,
    name: "",
    open: false,
  });
  const [selectedRoleId, setSelectedRoleId] = React.useState<number | null>(
    null,
  );
  const [activeFeature, setActiveFeature] = React.useState<number[]>([]);

  // Query hooks with better error handling
  const {
    data: rolesData,
    error: rolesError,
    isLoading: rolesLoading,
  } = useQuery({
    queryKey: [QUERY_KEYS.getAllRoles],
    queryFn: () => getAllRoles({ token }),
    enabled: !!token,
  });

  const roleNames = useMemo(
    () => rolesData?.map((role) => role.name) || [],
    [rolesData],
  );

  const currentRoleId = useMemo(
    () => rolesData?.find((role) => role.name === activeRole)?.id || null,
    [rolesData, activeRole],
  );

  const {
    data: getAllPagesData,
    error: getAllPagesError,
    isLoading: getAllPagesLoading,
  } = useQuery({
    queryKey: [QUERY_KEYS.getAllPages],
    queryFn: () => getAllPages({ token }),
    enabled: !!token,
  });

  // Group pages by category
  const categorizedPages = useMemo(() => {
    if (!getAllPagesData?.pages) return {};

    const pagesByCategory: { [key: string]: any[] } = {};
    getAllPagesData.pages.forEach((page) => {
      const category = page?.category || "Uncategorized";
      if (!pagesByCategory[category]) {
        pagesByCategory[category] = [];
      }
      pagesByCategory[category].push(page);
    });

    return pagesByCategory;
  }, [getAllPagesData?.pages]);

  const {
    data: getAllPagesAssignedToRoleData,
    isLoading: getAllPagesAssignedToRoleLoading,
    refetch: refetchGetAllPagesAssignedToRole,
    error: getAllPagesAssignedToRoleError,
  } = useQuery({
    queryKey: [QUERY_KEYS.getAllPagesAssignedToRole, currentRoleId],
    queryFn: () => getAllPagesAssignedToRole(currentRoleId, { token }),
    enabled: !!token && !!currentRoleId,
  });

  // Callback functions to prevent unnecessary re-renders
  const updateModal = useCallback(
    <K extends keyof ModalsState>(key: K, value: ModalsState[K]) => {
      setModals((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleError = useCallback((error: unknown) => {
    const axiosError = error as MyAxiosError;
    const errorMessage =
      axiosError.response?.data?.error ||
      `${axiosError.response?.status} ${axiosError.response?.statusText}` ||
      axiosError.message;
    toast.error(errorMessage);
  }, []);

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getAllRoles] });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.getAllPagesAssignedToRole],
    });
  }, [queryClient]);

  // Optimized mutation hooks
  const addRole = useMutation({
    mutationFn: (payload: { name: string }) =>
      createRole({ name: payload.name }, { token }),
    onSuccess: () => {
      updateModal("addModal", false);
      toast.success("Role Created Successfully");
      invalidateQueries();
      dispatch(fetchRoles({ token }));
    },
    onError: handleError,
  });

  const handleUpdateRole = useMutation({
    mutationFn: (payload: { id?: number | null; name: string }) =>
      updateRole(String(payload.id), { name: payload.name }, { token }),
    onSuccess: () => {
      setEditModal({
        updatedId: null,
        name: "",
        open: false,
      });
      toast.success("Role Updated Successfully");
      invalidateQueries();
    },
    onError: handleError,
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) =>
      deleteRoleService(String(roleId), { token }),
    onSuccess: () => {
      updateModal("deleteModal", false);
      setSelectedRoleId(null);
      toast.success("Role Deleted Successfully");
      invalidateQueries();
    },
    onError: handleError,
  });

  const assignPages = useMutation({
    mutationFn: (payload: { pageIds: number[] }) =>
      assignPagesToRole(currentRoleId, { token }, payload),
    onSuccess: () => {
      if (currentRoleId === user?.roleId) {
        dispatch(fetchAllPagesAssignToUser(currentRoleId || null, { token }));
      }
      refetchGetAllPagesAssignedToRole();
      updateModal("assignPagesModal", null);
      toast.success("Pages Assigned Successfully");
      invalidateQueries();
    },
    onError: handleError,
  });

  // Optimized toggle handler
  const handleToggle = useCallback((itemId: number, isChecked: boolean) => {
    setActiveFeature((prev) => {
      if (isChecked) {
        return prev.includes(itemId) ? prev : [...prev, itemId];
      } else {
        return prev.filter((id) => id !== itemId);
      }
    });
  }, []);

  // Optimized save handler
  const handleSave = useCallback(() => {
    if (activeFeature.length < 1) {
      toast.error("Please make changes first");
      return;
    }
    assignPages.mutate({ pageIds: activeFeature });
  }, [activeFeature, assignPages]);

  // Set default active role when roles data loads
  useEffect(() => {
    if (rolesData?.length && !activeRole) {
      setActiveRole(rolesData[0].name);
    }
  }, [rolesData, activeRole]);

  // Reset active features when role changes
  useEffect(() => {
    setActiveFeature(
      getAllPagesAssignedToRoleData?.pages?.map((page) => page.id) || [],
    );
  }, [activeRole, getAllPagesAssignedToRoleData?.pages]);

  // Loading and error states
  if (rolesLoading || getAllPagesLoading) return <LoadingBox />;
  if (rolesError || getAllPagesError) return <ErrorBox />;

  return (
    <>
      <div className={classes.container}>
        <main className={classes.mainBox}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Tabs
              tabsArray={roleNames}
              handleTabChange={setActiveRole}
              activeTab={activeRole}
              inlineTabsStyles={{
                width: "90%",
              }}
            />
            <div className={classes.roleHeader}>
              <Button
                text="Add Role"
                icon={<Plus />}
                clickFn={() => updateModal("addModal", true)}
              />
            </div>
          </div>

          <div className={classes.mainBoxHeader}>
            <h1>{activeRole} Permissions</h1>
            <p>
              Configure which features are accessible to users with the{" "}
              {activeRole.toLowerCase()} role
            </p>
          </div>

          {getAllPagesAssignedToRoleLoading ? (
            <LoadingBox />
          ) : (
            <div className={classes.categoriesContainer}>
              {Object.entries(categorizedPages).map(([category, pages]) => (
                <section key={category} className={classes.categoryBox}>
                  <h2 className={classes.categoryTitle}>{category}</h2>
                  <div className={classes.categoryContent}>
                    <ul className={classes.featuresList}>
                      {pages?.map((item: any) => (
                        <li key={item.id} className={classes.featureItem}>
                          <div className={classes.featureInfo}>
                            <span className={classes.featureName}>
                              {item.name}
                            </span>
                          </div>
                          <ToggleButton
                            value={activeFeature.includes(item.id)}
                            handleToggle={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleToggle(item.id, e.target.checked)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}
              <div className={classes.saveButton}>
                <Button
                  text="Save Changes"
                  clickFn={handleSave}
                  inlineStyling={{ borderRadius: "5px", width: "150px" }}
                  loading={assignPages.isPending}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddModal
        modalOpen={modals.addModal}
        handleClose={() => updateModal("addModal", false)}
        handleAdd={(payload) => addRole.mutate({ name: payload.name })}
        loading={addRole.isPending}
        success={addRole.isSuccess}
        heading="Add Role"
        subHeading="Fill all the fields in order to add a new role."
      />
      <UpdateModal
        modalOpen={editModal || false}
        handleClose={() =>
          setEditModal({
            updatedId: null,
            name: "",
            open: false,
          })
        }
        handleUpdate={(payload: { name: string }) =>
          handleUpdateRole.mutate({
            id: editModal?.updatedId ?? null,
            ...payload,
          })
        }
        loading={handleUpdateRole.isPending}
        success={handleUpdateRole.isSuccess}
        heading="Update Role"
        subHeading="Edit the fields in order to update the role."
        selectedPageData={editModal}
      />

      <DeleteModal
        modalOpen={modals.deleteModal}
        handleClose={() => {
          updateModal("deleteModal", false);
          setSelectedRoleId(null);
        }}
        handleDelete={() =>
          selectedRoleId && deleteRoleMutation.mutate(selectedRoleId)
        }
        heading="Delete Role"
        subHeading="Are you sure you want to delete this role?"
        loading={deleteRoleMutation.isPending}
      />

      <AssignPagesToRole
        modalOpen={modals.assignPagesModal?.modalOpen || false}
        handleClose={() => updateModal("assignPagesModal", null)}
        handleAdd={(payload) => assignPages.mutate(payload)}
        loading={assignPages.isPending}
        success={assignPages.isSuccess}
        heading="Assign Pages"
        subHeading="Fill all the fields in order to assign pages."
        pagesData={getAllPagesData}
      />
    </>
  );
};

export default Page;
