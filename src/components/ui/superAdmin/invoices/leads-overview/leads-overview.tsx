import React, {
  FC,
  memo,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import classes from "./leads-overview.module.css";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Table from "./table/table";
import { toast } from "react-toastify";
import LoadingBox from "@/components/global/loading-box/loading-box";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import SearchBox from "@/components/global/search-box/search-box";
import useDebounce from "@/utils/helpers/useDebounce";
import { MyAxiosError } from "@/services/error.type";
import { GenerateNewUserInvoice_Api_Payload_Type } from "@/types/leads/leads.type";
import NewUserInvoiceModal from "@/components/ui/superAdmin/invoices/newUserInvoice-modal/newUserInvoice-modal";
import {
  getAllNewUserInvoices,
  generateNewUserInvoice,
} from "@/services/dashboard/superAdmin/leads/leads";
import {
  GetAllNewUserInvoices_Api_Params_Type,
  GetAllNewUserInvoices_Api_Response_Type,
  LeadsFilterState,
} from "@/types/leads/leads.type";
import Button from "@/components/global/button/button";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import PaginationComponent from "@/components/global/pagination/pagination";
import LeadsOverviewMobileViewCard from "./leadsOverview-mobileView-card/leadsOverview-mobileView-card";
import { useMediaQuery } from "react-responsive";
import RefreshIcon from "@mui/icons-material/Refresh";

const INITIAL_FILTERS: LeadsFilterState = {
  limit: 10,
  page: 1,
  search: "",
  student_gender: "",
  parent_gender: "",
  board_id: null,
  curriculum_id: null,
  subject_id: null,
  grade_id: null,
};

// Memoized styles to prevent object recreation
const STATIC_STYLES = {
  searchBoxStyles: {
    minWidth: "250px",
    flex: "1",
  },
  dropDownStyles: {
    minWidth: "250px",
    flex: "1",
  },
  loadingBoxStyles: {
    flex: 1,
    minHeight: "500px",
  },
} as const;

// Memoized FiltersContainer component
interface FiltersContainerProps {
  filters: LeadsFilterState;
  filteredSubjects: string[];
  filteredBoards: string[];
  filteredGrades: string[];
  filteredCurriculum: string[];
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubjectFilter: (e: any) => void;
  handleCurriculumFilter: (e: any) => void;
  handleBoardFilter: (e: any) => void;
  handleGradeFilter: (e: any) => void;
}

const FiltersContainer = memo<FiltersContainerProps>(
  ({
    filters,
    filteredSubjects,
    filteredBoards,
    filteredGrades,
    filteredCurriculum,
    handleSearch,
    handleSubjectFilter,
    handleCurriculumFilter,
    handleBoardFilter,
    handleGradeFilter,
  }) => {
    // Memoized SearchBox props
    const searchBoxProps = useMemo(
      () => ({
        placeholder: "Search student name",
        changeFn: handleSearch,
        value: filters.search || "",
        inlineStyles: STATIC_STYLES.searchBoxStyles,
      }),
      [handleSearch, filters.search],
    );

    // Memoized FilterDropdown props for Subject
    const subjectFilterProps = useMemo(
      () => ({
        placeholder: "Filter subject",
        data: filteredSubjects,
        handleChange: handleSubjectFilter,
        value: JSON.stringify(filters.subject_id) || "",
        inlineBoxStyles: STATIC_STYLES.dropDownStyles,
        dropDownObject: true,
      }),
      [filteredSubjects, handleSubjectFilter, filters.subject_id],
    );

    // Memoized FilterDropdown props for Curriculum
    const curriculumFilterProps = useMemo(
      () => ({
        placeholder: "Filter curriculum",
        data: filteredCurriculum,
        handleChange: handleCurriculumFilter,
        value: JSON.stringify(filters.curriculum_id) || "",
        inlineBoxStyles: STATIC_STYLES.dropDownStyles,
        dropDownObject: true,
      }),
      [filteredCurriculum, handleCurriculumFilter, filters.curriculum_id],
    );

    // Memoized FilterDropdown props for Board
    const boardFilterProps = useMemo(
      () => ({
        placeholder: "Filter board",
        data: filteredBoards,
        handleChange: handleBoardFilter,
        value: JSON.stringify(filters.board_id) || "",
        inlineBoxStyles: STATIC_STYLES.dropDownStyles,
        dropDownObject: true,
      }),
      [filteredBoards, handleBoardFilter, filters.board_id],
    );

    // Memoized FilterDropdown props for Grade
    const gradeFilterProps = useMemo(
      () => ({
        placeholder: "Filter grade",
        data: filteredGrades,
        handleChange: handleGradeFilter,
        value: JSON.stringify(filters.grade_id) || "",
        inlineBoxStyles: STATIC_STYLES.dropDownStyles,
        dropDownObject: true,
      }),
      [filteredGrades, handleGradeFilter, filters.grade_id],
    );

    return (
      <div className={classes.filtersContainer}>
        <SearchBox {...searchBoxProps} />
        <FilterDropdown {...subjectFilterProps} />
        <FilterDropdown {...gradeFilterProps} />
        <FilterDropdown {...boardFilterProps} />
        <FilterDropdown {...curriculumFilterProps} />
      </div>
    );
  },
);

FiltersContainer.displayName = "FiltersContainer";

const LeadsOverview = ({ allInvoicesRefetch }: { allInvoicesRefetch: any }) => {
  const isMedium = useMediaQuery({ query: "(max-width: 1000px)" });
  const { token } = useAppSelector((state) => state?.user);
  const { subject, board, grades, curriculum } = useAppSelector(
    (state) => state.resources,
  );
  const [filters, setFilters] = useState<LeadsFilterState>(INITIAL_FILTERS);
  const [newUserInvoiceModalOpen, setNewUserInvoiceModalOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 1500);

  const loadingBoxStyles = useMemo(
    () => ({
      flex: 1,
      minHeight: "500px",
    }),
    [],
  );

  // Memoized filtered arrays to prevent unnecessary recalculations
  const filteredSubjects = useMemo(
    () => subject?.map((item) => JSON.stringify(item)) || [],
    [subject],
  );
  const filteredBoards = useMemo(
    () => board?.map((item) => JSON.stringify(item)) || [],
    [board],
  );
  const filteredGrades = useMemo(
    () => grades?.map((item) => JSON.stringify(item)) || [],
    [grades],
  );
  const filteredCurriculum = useMemo(
    () => curriculum?.map((item) => JSON.stringify(item)) || [],
    [curriculum],
  );

  // Memoized handlers
  const handleToggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  const handleNewUserInvoiceModalOpen = useCallback(() => {
    setNewUserInvoiceModalOpen(true);
  }, []);

  const handleNewUserInvoiceModalClose = useCallback(() => {
    setNewUserInvoiceModalOpen(false);
  }, []);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({
        ...prev,
        search: value,
        page: 1,
      }));
    },
    [],
  );

  const handleSubjectFilter = useCallback((e: any) => {
    const value = JSON.parse(e.target.value);
    setFilters((prev) => ({
      ...prev,
      subject_id: value ? value : null,
      page: 1,
    }));
  }, []);

  const handleCurriculumFilter = useCallback((e: any) => {
    const value = JSON.parse(e.target.value);
    setFilters((prev) => ({
      ...prev,
      curriculum_id: value ? value : null,
      page: 1,
    }));
  }, []);

  const handleBoardFilter = useCallback((e: any) => {
    const value = JSON.parse(e.target.value);
    setFilters((prev) => ({
      ...prev,
      board_id: value ? value : null,
      page: 1,
    }));
  }, []);

  const handleGradeFilter = useCallback((e: any) => {
    const value = JSON.parse(e.target.value);
    setFilters((prev) => ({
      ...prev,
      grade_id: value ? value : null,
      page: 1,
    }));
  }, []);

  const handleChangePage = useCallback((e: any, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleChangeRowsPerPage = useCallback((e: any) => {
    setFilters((prev) => ({
      ...prev,
      limit: e.target.value,
      page: 1,
    }));
  }, []);

  const handleDeleteModal = useCallback((id?: number) => {
    console.log("Handle delete modal for lead:", id);
  }, []);

  // Memoized query params
  const queryParams = useMemo(
    (): GetAllNewUserInvoices_Api_Params_Type => ({
      limit: filters.limit,
      page: filters.page,
      search: debouncedSearch,
      student_gender: filters.student_gender,
      parent_gender: filters.parent_gender,
      board_id: filters.board_id?.id || null,
      curriculum_id: filters.curriculum_id?.id || null,
      subject_id: filters.subject_id?.id || null,
      grade_id: filters.grade_id?.id || null,
    }),
    [
      filters.limit,
      filters.page,
      debouncedSearch,
      filters.student_gender,
      filters.parent_gender,
      filters.board_id,
      filters.curriculum_id,
      filters.subject_id,
      filters.grade_id,
    ],
  );

  const { data, error, isLoading, isRefetching, refetch } =
    useQuery<GetAllNewUserInvoices_Api_Response_Type>({
      queryKey: [
        "getAllLeads",
        filters.page,
        filters.limit,
        debouncedSearch,
        filters.student_gender,
        filters.parent_gender,
        filters.board_id,
        filters.curriculum_id,
        filters.subject_id,
        filters.grade_id,
      ],
      queryFn: () => {
        return getAllNewUserInvoices({ ...queryParams }, { token });
      },
      refetchOnWindowFocus: false,
      staleTime: 30000,
      refetchInterval: 30000,
      enabled: !!token,
    });

  const handleNewUserInvoice = useMutation({
    mutationFn: (payload: GenerateNewUserInvoice_Api_Payload_Type) =>
      generateNewUserInvoice(payload, {
        token,
      }),
    onSuccess: (data: any) => {
      allInvoicesRefetch();
      refetch();
      setNewUserInvoiceModalOpen(false);
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("New User Invoice Generated Successfully");
      }
      return data;
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? `${axiosError?.response?.data?.message}`
            : axiosError?.response?.data?.error
              ? `${axiosError?.response?.data?.error}`
              : `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const mobileFilterButtonProps = useMemo(
    () => ({
      onClick: handleToggleMobileFilters,
      isOpen: showMobileFilters,
    }),
    [handleToggleMobileFilters, showMobileFilters],
  );

  // Memoized table data
  const tableData = useMemo(
    () => ({
      leads: data && "data" in data ? data.data.leads : [],
      currentPage:
        data && "data" in data ? data.data.pagination.currentPage : 1,
      totalCount: data && "data" in data ? data.data.pagination.totalItems : 0,
      totalPages: data && "data" in data ? data.data.pagination.totalPages : 1,
      rowsPerPage:
        data && "data" in data ? data.data.pagination.itemsPerPage : 10,
    }),
    [data],
  );

  // Memoized Button props
  const buttonProps = useMemo(
    () => ({
      text: "Generate New User Invoice",
      clickFn: handleNewUserInvoiceModalOpen,
      inlineStyles: { width: "150px" },
    }),
    [handleNewUserInvoiceModalOpen],
  );

  // Memoized Table props
  const tableProps = useMemo(
    () => ({
      leads: tableData.leads,
      handleDeleteModal: handleDeleteModal,
    }),
    [tableData.leads, handleDeleteModal],
  );

  // Memoized NewUserInvoiceModal props
  const newUserInvoiceModalProps = useMemo(
    () => ({
      modalOpen: newUserInvoiceModalOpen,
      handleClose: handleNewUserInvoiceModalClose,
      heading: "New User Invoice",
      subHeading: "Fill out the form in order to create new user invoice.",
      handleAdd: (payload: GenerateNewUserInvoice_Api_Payload_Type) =>
        handleNewUserInvoice.mutate(payload),
      loading: handleNewUserInvoice.isPending,
      success: handleNewUserInvoice.isSuccess,
    }),
    [
      newUserInvoiceModalOpen,
      handleNewUserInvoiceModalClose,
      handleNewUserInvoice.mutate,
      handleNewUserInvoice.isPending,
      handleNewUserInvoice.isSuccess,
    ],
  );

  // Memoized FiltersContainer props
  const filtersContainerProps = useMemo(
    () => ({
      filters,
      filteredSubjects,
      filteredBoards,
      filteredGrades,
      filteredCurriculum,
      handleSearch,
      handleSubjectFilter,
      handleCurriculumFilter,
      handleBoardFilter,
      handleGradeFilter,
    }),
    [
      filters,
      filteredSubjects,
      filteredBoards,
      filteredGrades,
      filteredCurriculum,
      handleSearch,
      handleSubjectFilter,
      handleCurriculumFilter,
      handleBoardFilter,
      handleGradeFilter,
    ],
  );

  // Error handling
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
      <main className={classes.LeadsOverviewContainer}>
        <div className={classes.header}>
          <header className={classes.headingAcions}>
            <div className={classes.headingBox}>
              <p className={classes.heading}>Leads Overview</p>
              <div className={classes.iconBox} onClick={() => refetch()}>
                <RefreshIcon sx={{ fontSize: "var(--regular16-)" }} />
              </div>
            </div>
            <div className={classes.filtersSection}>
              <MobileFilterButton {...mobileFilterButtonProps} />
              <Button {...buttonProps} />
            </div>
          </header>

          {showMobileFilters && <FiltersContainer {...filtersContainerProps} />}
        </div>
        {isLoading || isRefetching ? (
          <LoadingBox inlineStyling={loadingBoxStyles} />
        ) : isMedium ? (
          <div className={classes.leadsOverviewMobileViewCardBox}>
            {tableData.leads?.map((item) => (
              <LeadsOverviewMobileViewCard
                key={item.id}
                item={item}
                handleDeleteModal={handleDeleteModal}
              />
            ))}
          </div>
        ) : (
          <Table {...tableProps} />
        )}
        <PaginationComponent
          totalPages={tableData.totalPages}
          page={tableData.currentPage || 0}
          rowsPerPage={tableData.rowsPerPage || 0}
          totalEntries={tableData.totalCount || 0}
          onPageChange={handleChangePage}
          rowsPerPageChange={handleChangeRowsPerPage}
          dropDownValues={[50, 75, 100]}
          inlineStyles={{
            height: "max-content",
          }}
        />
      </main>
      <NewUserInvoiceModal {...newUserInvoiceModalProps} />
    </>
  );
};

export default memo(LeadsOverview);
