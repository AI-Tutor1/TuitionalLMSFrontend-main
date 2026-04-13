"use client";
import React from "react";
import classes from "./roles.module.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllRoles,
  updateRole,
  deleteRole,
  createRole,
} from "@/services/dashboard/roles/roles";
import RoleTable from "@/components/ui/superAdmin/role/role-table/role-table";
import { MyAxiosError } from "@/services/error.type";
import { toast } from "react-toastify";
import DeleteEnrollmentModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import AddModal from "@/components/ui/superAdmin/role/add-modal/add-Modal";
import UpdateModal from "@/components/ui/superAdmin/role/update-modal/update-modal";
import Button from "@/components/global/button/button";
import { Plus } from "lucide-react";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { fetchRoles } from "@/lib/store/slices/role-slice";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks/hooks";

const Roles = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);
  const [addModal, setAddModal] = React.useState<boolean>(false);
  const [updateModal, setUpdateModal] = React.useState<{
    open: boolean;
    updatedId: number | null;
    name?: string;
  }>({ open: false, updatedId: null, name: "" });
  const [deleteModal, setDeleteModal] = React.useState<{
    open: boolean;
    deleteId: number | null;
  }>({ open: false, deleteId: null });

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["getAllRoles"],
    queryFn: () => {
      return getAllRoles({ token });
    },
    enabled: !!token,
  });

  const createRoleMutation = useMutation({
    mutationFn: (roleData: any) => {
      return createRole(roleData, { token });
    },
    onSuccess: () => {
      setAddModal(false);
      refetch();
      toast.success("Role created successfully");
      dispatch(fetchRoles({ token }));
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

  const updateRoleMutation = useMutation({
    mutationFn: (roleData: any) => {
      return updateRole(String(updateModal?.updatedId), roleData, { token });
    },
    onSuccess: () => {
      setUpdateModal({ open: false, updatedId: null });
      refetch();
      toast.success("Role updated successfully");
      dispatch(fetchRoles({ token }));
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

  const deleteRoleMutation = useMutation({
    mutationFn: (deleteId: number) => {
      return deleteRole(String(deleteId), { token });
    },
    onSuccess: () => {
      setDeleteModal({ open: false, deleteId: null });
      refetch();
      toast.success("Role deleted successfully");
      dispatch(fetchRoles({ token }));
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

  if (isLoading) {
    return <LoadingBox />;
  }
  if (error) {
    return <ErrorBox />;
  }

  return (
    <>
      <div className={classes.mainContainer}>
        <div className={classes.buttonBox}>
          <Button
            icon={<Plus />}
            text="Add Role"
            clickFn={() => setAddModal(true)}
            loading={createRoleMutation.isPending}
            disabled={createRoleMutation.isPending}
            inlineStyling={{ margin: "0 8px" }}
          />
        </div>
        <RoleTable
          data={data || []}
          onDeleteClick={(id: number) => {
            setDeleteModal({ open: true, deleteId: id });
          }}
          onEditClick={(item: any) => {
            setUpdateModal({ open: true, updatedId: item.id, name: item.name });
          }}
        />
      </div>
      <AddModal
        modalOpen={addModal}
        handleClose={() => setAddModal(false)}
        heading="Add Role"
        subHeading="Please fill in the details to add a new role."
        handleAdd={(payload) => createRoleMutation.mutate({ ...payload })}
        loading={createRoleMutation.isPending}
        success={createRoleMutation.isSuccess}
      />

      <UpdateModal
        modalOpen={updateModal}
        handleClose={() => setUpdateModal({ open: false, updatedId: null })}
        heading="Update Role"
        subHeading="Please fill in the details to update the role."
        handleUpdate={(payload) => {
          updateRoleMutation.mutate({ ...payload });
        }}
        loading={updateRoleMutation.isPending}
        success={updateRoleMutation.isSuccess}
        // selectedRoleData={updateModal?.name || ""}
      />

      <DeleteEnrollmentModal
        modalOpen={deleteModal?.open || false}
        handleDelete={() => {
          if (deleteModal?.deleteId) {
            deleteRoleMutation.mutate(deleteModal.deleteId);
          }
        }}
        handleClose={() => setDeleteModal({ open: false, deleteId: null })}
        heading="Delete Role"
        subHeading="Are you sure you want to delete this role?"
        loading={deleteRoleMutation.isPending}
      />
    </>
  );
};

export default Roles;
