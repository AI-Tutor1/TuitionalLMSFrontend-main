"use client";
import styles from "./students.module.css";
import { Grid } from "@mui/material";
import { useState, useEffect, useRef, useCallback, useMemo, FC } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks/hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import SearchBox from "@/components/global/search-box/search-box";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import Button from "@/components/global/button/button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { getAllStudents } from "@/services/dashboard/superAdmin/students/students";
import AddModal from "@/components/ui/superAdmin/users/add-modal/add-moadl";
import { emailRegex } from "@/utils/helpers/regex";
import StudentsTable from "@/components/ui/superAdmin/students/students-table/students-table";
import { Country } from "country-state-city";
import Image from "next/image";

const Students: FC = () => {
  const token = useAppSelector((state) => state?.user?.token);
  const roles = useAppSelector((state) => state.roles.roles);
  //   console.log(roles);
  const rolesArr = useMemo(() => {
    return roles?.map((item: any) => JSON.stringify(item));
  }, []);
  const countries = useMemo(() => {
    return Country?.getAllCountries()?.map((item: any) => JSON.stringify(item));
  }, []);

  //   // modal states
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  //   const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  //   const [deactivateId, setDeactivateId] = useState<string>("");
  // pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  // date filter states
  const [dateFilter, setDateFilter] = useState<any>("");
  // search filter states
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchItem, setDebouncedSearchItem] = useState<string>("");
  // country filter states
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [userType, setUserTypeFilter] = useState("");

  // pagination handler
  const handleChangePage = useCallback((e: any, newPage: number) => {
    // console.log(newPage);
    setCurrentPage(newPage);
  }, []);
  const handleChangeRowsPerPage = useCallback((e: any) => {
    setRowsPerPage(e?.target?.value);
  }, []);
  // date filter handler
  const handleCalendar = useCallback((value: any) => {
    // console.log(value);
    if (value === null) {
      setDateFilter("");
    } else {
      setDateFilter(value);
    }
  }, []);
  // search filter handler
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchItem(searchValue);
    }, 1500);
    // Cleanup timeout when component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  // country filter handler
  const handleCountryFilter = useCallback((e: any) => {
    setCountryFilter(e.target.value);
  }, []);

  //   // userType filter handler
  //   const handleUserTypeFilter = useCallback((e: any) => {
  //     setUserTypeFilter(e.target.value);
  //   }, []);

  const handeAddModalClose = useCallback((e: any) => {
    setAddModalOpen(false);
  }, []);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [
      "getAllStudents",
      currentPage,
      rowsPerPage,
      debouncedSearchItem,
      dateFilter,
      countryFilter,
      userType,
    ],
    queryFn: () =>
      getAllStudents(
        {
          startDate: dateFilter[0] || "",
          endDate: dateFilter[1] || "",
          userType: 3,
          limit: rowsPerPage,
          page: currentPage,
          name: emailRegex.test(debouncedSearchItem) ? "" : debouncedSearchItem,
          email: emailRegex.test(debouncedSearchItem)
            ? debouncedSearchItem
            : "",
          countryCode:
            countryFilter !== "" ? JSON.parse(countryFilter)?.isoCode : "",
        },
        { token }
      ),
  });

  //   const handleAdd = useMutation({
  //     mutationFn: (payload) =>
  //       adduser(payload, {
  //         token,
  //         contentType: "multipart/form-data",
  //       }),
  //     onSuccess: (data: any) => {
  //       if (data.message || data.error) {
  //         return toast.error(data.message || data.error);
  //       }
  //       setAddModalOpen(false);
  //       toast.success("User Add Successfully");
  //       refetch();
  //     },
  //     onError: (error) => {
  //       const axiosError = error as MyAxiosError;
  //       if (axiosError.response) {
  //         toast.error(
  //           axiosError.response.data.error ||
  //             `${axiosError.response.status} ${axiosError.response.statusText}`
  //         );
  //       } else {
  //         toast.error(axiosError.message);
  //       }
  //       setAddModalOpen(false);
  //     },
  //   });

  //   const handleDeactivate = useMutation({
  //     mutationFn: (payload: { id: string }) =>
  //       deactivateUser(payload, {
  //         token,
  //       }),
  //     onSuccess: () => {
  //       setDeleteModalOpen(false);
  //       setDeactivateId("");
  //       toast.success("User Deleted Successfully");
  //       refetch();
  //     },
  //     onError: (error) => {
  //       const axiosError = error as MyAxiosError;
  //       if (axiosError.response) {
  //         toast.error(
  //           axiosError.response.data.error ||
  //             `${axiosError.response.status} ${axiosError.response.statusText}`
  //         );
  //       } else {
  //         toast.error(axiosError.message);
  //       }
  //       setDeleteModalOpen(false);
  //       setDeactivateId("");
  //     },
  //   });

  if (error) {
    const axiosError = error as MyAxiosError;
    if (axiosError.response) {
      toast.error(axiosError.response.data.error);
    } else {
      toast.error(axiosError.message);
    }
  }
  return (
    <>
      <main className={styles.container}>
        <Grid container className={styles.section1}>
          <Grid
            item
            xs={12}
            sm={12}
            md={9}
            lg={9}
            xl={9}
            className={styles.aside1}
          >
            <SearchBox
              placeholder="Search any student"
              changeFn={handleSearch}
              inlineStyles={{ height: "100%", width: "25%" }}
            />
            <FilterByDate changeFn={handleCalendar} width="25%" />
            <div className={styles.wrapper2}>
              <div className={styles.imageBox}>
                <Image
                  src="/assets/svg/filterSvg.svg"
                  alt="filter"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <DropDown
                placeholder="Filter By Country"
                data={countries}
                handleChange={handleCountryFilter}
                value={countryFilter}
                inlineDropDownStyles={{
                  borderRadius: "none",
                  boxShadow: "none !important",
                  width: "85%",
                  background: "none !important",
                  padding: "0px 10px",
                }}
              />
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={2}
            lg={2}
            xl={2}
            className={styles.aside2}
          >
            <Button
              text="Add New Student"
              icon={<AddOutlinedIcon />}
              inlineStyling={{
                borderRadius: "10px",
                fontSize: "var(--normal-text-size)",
                width: "11vw",
                height: "100%",
              }}
              clickFn={() => setAddModalOpen(true)}
            />
          </Grid>
        </Grid>

        <StudentsTable
          data={data?.users || []}
          currentPage={data?.currentPage || 1}
          totalCount={data?.totalCount || data?.users.length || 1}
          totalPages={data?.totalPages || 1}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          //   handleDeletemodal={(id) => {
          //     setDeleteModalOpen(true);
          //     setDeactivateId(id.toString());
          //   }}
          isLoading={isLoading}
        />
      </main>
      <AddModal
        modalOpen={addModalOpen}
        handleClose={handeAddModalClose}
        heading={`Add Student`}
        subHeading={`Fill out the form in order to create the student`}
        // handleAdd={(payload) => handleAdd.mutate(payload)}
        // loading={handleAdd?.isPending}
      />{" "}
      {/*
      <DeleteModal
        modalOpen={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        subHeading="This action cannot be undone. All values associated with this field will be lost."
        heading="Are You Sure?"
        handleDelete={() => {
          handleDeactivate.mutate({ id: deactivateId?.toString() });
        }}
        loading={handleDeactivate.isPending}
      /> */}
    </>
  );
};

export default Students;
