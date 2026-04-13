"use client";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import {
  FileText,
  Plus,
  Trash2,
  Clock,
  Eye,
  Loader2,
  Pencil,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import useDebounce from "@/utils/helpers/useDebounce";
import { MyAxiosError } from "@/services/error.type";
import {
  getAllPolicies,
  createNewPolicy,
  deletePolicy,
  updatePolicy,
} from "@/services/dashboard/superAdmin/policies/policies";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import OriginalButton from "@/components/global/button/button";
import NewPolicyModal from "@/components/ui/superAdmin/policy/newPolicy-modal/newPolicy-Modal";
import UpdatePolicyModal from "@/components/ui/superAdmin/policy/updatePolicy-modal/updatePolicy-modal";
import ViewPolicyModal from "@/components/ui/superAdmin/policy/viewPolicy-modal/viewPolicy-modal";
import SearchBox from "@/components/global/search-box/search-box";
import { sanitizeHTML } from "@/utils/helpers/sanitize-html";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import {
  CreateNewPolicy_Api_Payload,
  CreateNewPolicy_Api_Response,
} from "@/types/policies/createNewPolicy.type";
import { GetAllPolicies_Api_Response } from "@/types/policies/getAllPolicies.type";
import { DeletePolicy_Api_Response } from "@/types/policies/deletePolicy.type";
import classes from "./policies.module.css";
import { useParams } from "next/navigation";

const categories = [
  "Professional Standards",
  "Academic Policies",
  "Safety & Security",
  "Technology",
  "Communication",
  "HR Policies",
  "Student Affairs",
  "Finance",
];
const assignedRoles = ["Teacher", "Student", "Parent"];

export default function Policies() {
  const { role } = useParams();
  const { token, user } = useAppSelector((state: any) => state?.user);
  const [title, setTitle] = useState("");
  const debouncedTitle = useDebounce(title, 1500);
  const [category, setCategory] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [updatePolicyValues, setUpdatePolicyValues] = useState<any>(null);
  const [updatePolicyModal, setUpdatePolicyModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewPolicyModal, setViewPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  // Fetch policies
  const {
    data: policiesResponse,
    error,
    isLoading,
    refetch,
  } = useQuery<GetAllPolicies_Api_Response, MyAxiosError>({
    queryKey: ["getAllPolicies", debouncedTitle, category, assignedTo],
    queryFn: () =>
      getAllPolicies(
        {
          title: debouncedTitle.toLowerCase(),
          category: category.toLowerCase(),
          assignedTo:
            user.roleId === 5
              ? "teacher"
              : user.roleId === 3
                ? "student"
                : assignedTo.toLowerCase(),
        },
        { token },
      ),
    staleTime: 60000,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  // Create policy mutation (replace with actual API call)
  const createPolicyMutation = useMutation({
    mutationFn: (payload: CreateNewPolicy_Api_Payload) =>
      createNewPolicy(payload, { token }),
    onSuccess: (data: CreateNewPolicy_Api_Response) => {
      toast.success(data.message || "Policy created Successfully");
      refetch();
      setIsCreateModal(false);
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create policy";
      toast.error(errorMessage);
    },
  });

  // Create policy mutation (replace with actual API call)
  const updatePolicyMutation = useMutation({
    mutationFn: (payload: CreateNewPolicy_Api_Payload) =>
      updatePolicy(updatePolicyValues?.id || null, payload, { token }),
    onSuccess: (data: CreateNewPolicy_Api_Response) => {
      toast.success(data.message || "Policy updated Successfully");
      refetch();
      setUpdatePolicyModal(false);
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update policy";
      toast.error(errorMessage);
    },
  });

  // Delete policy mutation (replace with actual API call)
  const deletePolicyMutation = useMutation({
    mutationFn: (deleteId: number) => deletePolicy(deleteId, { token }),
    onSuccess: (data: DeletePolicy_Api_Response) => {
      toast.success(data.message || "Policy deleted Successfully");
      refetch();
    },
    onError: (error: MyAxiosError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete policy";
      toast.error(errorMessage);
    },
  });

  const handleDeletePolicy = (deleteId: number) => {
    setDeleteId(deleteId);
    deletePolicyMutation.mutate(deleteId);
  };

  // Handle error display
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
    <>
      <div className={classes.container}>
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.filtersGrid}>
            <SearchBox
              value={title}
              changeFn={(e: any) => setTitle(e.target.value)}
              placeholder="Search policies..."
              inlineStyles={{
                background: "var(--main-white-color)",
              }}
            />
            <FilterDropdown
              placeholder="Select category"
              data={categories}
              handleChange={(value: string) => setCategory(value)}
              value={category}
              inlineBoxStyles={{
                background: "var(--main-white-color)",
              }}
            />
            {user.roleId !== 5 && user.roleId !== 3 && (
              <FilterDropdown
                placeholder="Select assigned role"
                data={assignedRoles}
                handleChange={(value: string) => setAssignedTo(value)}
                value={assignedTo}
                inlineBoxStyles={{
                  background: "var(--main-white-color)",
                }}
              />
            )}
            <div className={classes.totalCount}>
              Total:{" "}
              {policiesResponse?.data ? policiesResponse?.data.length : 0}{" "}
              policies
            </div>
          </div>
          {user.roleId !== 5 && (
            <OriginalButton
              text="Create Policy"
              clickFn={() => setIsCreateModal(true)}
              icon={<Plus className={classes.iconSmall} />}
            />
          )}
        </div>

        {/* Policies List */}
        {isLoading ? (
          <LoadingBox inlineStyling={{ flex: 1 }} />
        ) : (policiesResponse?.data?.length || 0) === 0 ? (
          <ErrorBox inlineStyling={{ flex: 1 }} />
        ) : (
          <div className={classes.policiesList}>
            {policiesResponse?.data?.map((policy: any) => (
              <div key={policy.id} className={classes.card}>
                <div className={classes.cardHeader}>
                  <div className={classes.cardHeaderContent}>
                    <div className={classes.cardHeaderMain}>
                      <div className={classes.cardTitleRow}>
                        <h3 className={classes.cardTitle}>{policy.title}</h3>
                        {role !== "teacher" && role !== "student" && (
                          <div className={classes.assignedRole}>
                            <span
                              className={classes.capitalizeText}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "5px 10px",
                                borderRadius: "5px",
                                color:
                                  policy.assigned_to === "Super Admin"
                                    ? "#653838"
                                    : policy.assigned_to === "Admin"
                                      ? "#653838"
                                      : policy.assigned_to === "Teacher"
                                        ? "#2F3282"
                                        : policy.assigned_to === "Student"
                                          ? "#286320"
                                          : policy.assigned_to === "Parent"
                                            ? "#2F3282"
                                            : "#2F3282",
                                backgroundColor:
                                  policy.assigned_to === "Super Admin"
                                    ? "#FFACAC"
                                    : policy.assigned_to === "Admin"
                                      ? "#FFACAC"
                                      : policy.assigned_to === "Teacher"
                                        ? "#DBDCFF"
                                        : policy.assigned_to === "Student"
                                          ? "#96EFCF"
                                          : policy.assigned_to === "Parent"
                                            ? "#DBDCFF"
                                            : "#DBDCFF",
                              }}
                            >
                              {policy.assigned_to}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={classes.cardDescription}>
                        <div className={classes.categoryBadge}>
                          {policy.category}
                        </div>
                        <span className={classes.createdDate}>
                          <Clock className={classes.iconTiny} />
                          &nbsp;&nbsp;
                          {moment
                            .utc(policy.createdAt)
                            .local()
                            .format("Do-MMMM-YYYY")}
                        </span>
                      </div>
                    </div>
                    <div className={classes.cardActions}>
                      <div
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setViewPolicyModal(true);
                        }}
                      >
                        <Eye className={classes.iconSmall} />
                      </div>
                      {user.roleId !== 5 &&
                        user.roleId !== 3 &&
                        user.roleId !== 4 && (
                          <>
                            <div
                              onClick={() => {
                                setUpdatePolicyModal(true);
                                setUpdatePolicyValues(policy);
                              }}
                            >
                              {updatePolicyMutation.isPending ? (
                                <Loader2 className={classes.iconSpinning} />
                              ) : (
                                <Pencil className={classes.iconSmall} />
                              )}
                            </div>
                            <div onClick={() => handleDeletePolicy(policy.id)}>
                              {deletePolicyMutation.isPending &&
                              policy.id === deleteId ? (
                                <Loader2 className={classes.iconSpinning} />
                              ) : (
                                <Trash2 className={classes.iconSmall} />
                              )}
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                </div>
                <div className={classes.cardContent}>
                  <div
                    className={classes.policyContent}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHTML(policy.policy_content || ""),
                    }}
                  />{" "}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <NewPolicyModal
        loading={createPolicyMutation.isPending}
        success={createPolicyMutation.isSuccess}
        modalOpen={isCreateModal}
        handleClose={() => setIsCreateModal(false)}
        heading="Create New Policy"
        subHeading="Create a new institutional policy or guideline"
        handleAdd={(payload: any) =>
          createPolicyMutation.mutate({
            title: payload.title,
            policy_content: payload.content,
            category: payload.category,
            assigned_to: payload.assigned_to,
          })
        }
      />
      <UpdatePolicyModal
        loading={updatePolicyMutation.isPending}
        success={updatePolicyMutation.isSuccess}
        modalOpen={updatePolicyModal}
        handleClose={() => {
          setUpdatePolicyModal(false);
          setUpdatePolicyValues(null);
        }}
        heading="Update Policy"
        subHeading="Update an existing institutional policy or guideline"
        values={updatePolicyValues}
        handleUpdate={(payload: any) =>
          updatePolicyMutation.mutate({
            ...payload,
          })
        }
      />
      <ViewPolicyModal
        modalOpen={viewPolicyModal}
        handleClose={() => {
          setViewPolicyModal(false);
          setSelectedPolicy(null);
        }}
        values={selectedPolicy}
      />
    </>
  );
}
