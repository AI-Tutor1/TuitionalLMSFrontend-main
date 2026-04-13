"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import classes from "./tutor-request.module.css";
import { useQuery } from "@tanstack/react-query";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import SearchBox from "@/components/global/search-box/search-box";
import TutorRequestTable from "@/components/ui/superAdmin/tutorRequest/tutorRequest-table/tutorRequest-table";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { getAllRequest } from "@/services/dashboard/superAdmin/tutor-request/tutor-request";
import { Onboarding_Requests_Parsed } from "@/services/dashboard/superAdmin/tutor-request/tutor-request.types";
import { MyAxiosError } from "@/services/error.type";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import useDebounce from "@/utils/helpers/useDebounce";
import { toast } from "react-toastify";
import { Country } from "country-state-city";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import { setInlineStyles } from "rsuite/esm/List/helper/utils";

const statusOptions = [
  { id: "status-pending", name: "Pending" },
  { id: "status-approved", name: "Approved" },
  { id: "status-rejected", name: "Rejected" },
];

const TutorRequest: React.FC = () => {
  const { subject } = useAppSelector((state) => state?.resources);
  const { token } = useAppSelector((state) => state?.user);
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [searchItem, setSearchItem] = useState<string>("");
  const debouncedSearch = useDebounce(searchItem, 1500);
  const [dateFilter, setDateFilter] = useState<any>("");
  const [selectedStatuses, setSelectedStatuses] = useState<any[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);

  const filteredSubjects = useMemo(() => subject || [], [subject]);
  const countries = useMemo(
    () =>
      Country.getAllCountries().map((item, index) => ({
        id: `country-${index}`,
        name: item.name,
      })),
    [],
  );

  // search handler - simplified to just update state
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchItem(e.target.value);
  }, []);

  // Handle subject filter change - for multi-select
  const handleSubjectFilter = useCallback((event: any, value: any[]) => {
    setSelectedSubjects(value);
  }, []);

  // Handle status filter change - updated for multi-select
  const handleStatusFilter = useCallback((event: any, value: any[]) => {
    setSelectedStatuses(value);
  }, []);

  // Handle country filter change - updated for multi-select
  const handleCountryFilter = useCallback((event: any, value: any[]) => {
    setSelectedCountries(value);
  }, []);

  // date filter handler
  const handleCalendar = useCallback((value: any) => {
    if (value === null) {
      setDateFilter("");
    } else {
      setDateFilter(value);
    }
  }, []);

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  // Fetch data using react-query
  const { data, error, isLoading } = useQuery({
    queryKey: ["tutor-requests", dateFilter],
    queryFn: () =>
      getAllRequest(
        {
          startDate: dateFilter[0] || "",
          endDate: dateFilter[1] || "",
        },
        {
          token,
        },
      ),
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Parse the data (jsonData)
  const parsedData = useMemo(() => {
    if (!data) return null;
    return data.map((item) => {
      const { jsonData, ...rest } = item;
      const parsed_jsonData = jsonData ? JSON.parse(jsonData) : null;
      return { ...rest, parsed_jsonData };
    });
  }, [data]);

  // Filter based on search term AND multi-select filters
  const filteredList = useMemo(() => {
    if (!parsedData) return [];
    const searchTerm = debouncedSearch.toLowerCase();

    return parsedData?.filter((item: Onboarding_Requests_Parsed) => {
      const userData = item?.parsed_jsonData;

      const fullName = `${userData?.firstName?.toLowerCase() || ""} ${
        userData?.lastName?.toLowerCase() || ""
      }`;
      const email = userData?.email?.toLowerCase() || "";

      // Check if search term matches
      const isSearchMatch =
        !searchTerm ||
        fullName.includes(searchTerm) ||
        email.includes(searchTerm);

      // Check if status matches - updated for multi-select
      const isStatusMatch =
        selectedStatuses.length === 0 ||
        selectedStatuses.some(
          (selectedStatus) =>
            item?.status?.toLowerCase() === selectedStatus?.name?.toLowerCase(),
        );

      // Check if country matches - updated for multi-select
      const isCountryMatch =
        selectedCountries.length === 0 ||
        selectedCountries.some(
          (selectedCountry) =>
            item?.parsed_jsonData?.country?.toLowerCase() ===
            selectedCountry?.name?.toLowerCase(),
        );

      // Check if subject matches - for multi-select
      const isSubjectMatch =
        selectedSubjects.length === 0 ||
        selectedSubjects.some((selectedSubject) =>
          item?.parsed_jsonData?.subjects?.some(
            (subject: any) => subject?.name === selectedSubject?.name,
          ),
        );

      // Return true only if ALL conditions are met
      return isSearchMatch && isStatusMatch && isCountryMatch && isSubjectMatch;
    });
  }, [
    parsedData,
    debouncedSearch,
    selectedStatuses,
    selectedCountries,
    selectedSubjects,
  ]);

  // Memoize props

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: {
        width: "max-content",
        alignSelf: "flex-end",
        marginTop: "5px",
      },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  const searchBoxProps = useMemo(
    () => ({
      placeholder: "Search any request",
      changeFn: handleSearch,
      inlineStyles: styles.dropDownStyles,
    }),
    [handleSearch],
  );

  const filterByDateProps = useMemo(
    () => ({
      changeFn: handleCalendar,
      minWidth: styles?.dropDownStyles?.minWidth,
      flex: 1,
      background: styles.dropDownStyles.background,
    }),
    [handleCalendar],
  );

  const multiSelectSubjectProps = useMemo(
    () => ({
      placeholder: "Filter by subjects",
      data: filteredSubjects,
      handleChange: handleSubjectFilter,
      value: selectedSubjects,
      icon: true,
      inlineBoxStyles: styles.dropDownStyles,
    }),
    [filteredSubjects, handleSubjectFilter, selectedSubjects],
  );

  // Updated status filter props for multi-select
  const multiSelectStatusProps = useMemo(
    () => ({
      placeholder: "Filter by status",
      data: statusOptions,
      handleChange: handleStatusFilter,
      value: selectedStatuses,
      icon: true,
      inlineBoxStyles: styles.dropDownStyles,
    }),
    [handleStatusFilter, selectedStatuses],
  );

  // Updated country filter props for multi-select
  const multiSelectCountryProps = useMemo(
    () => ({
      placeholder: "Filter by country",
      data: countries,
      handleChange: handleCountryFilter,
      value: selectedCountries,
      icon: true,
      inlineBoxStyles: styles.dropDownStyles,
    }),
    [countries, handleCountryFilter, selectedCountries],
  );

  const tutorRequestTableProps = useMemo(
    () => ({
      data: filteredList || [],
    }),
    [filteredList],
  );

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
    <main className={classes.container}>
      <div className={classes.section2}>
        <MobileFilterButton {...mobileFilterButtonProps} />
        {showFullFilters && (
          <div className={classes.filtersBox}>
            <FilterByDate {...filterByDateProps} />
            <SearchBox {...searchBoxProps} />
            <MultiSelectDropDown {...multiSelectSubjectProps} />
            <MultiSelectDropDown {...multiSelectStatusProps} />
            <MultiSelectDropDown {...multiSelectCountryProps} />
          </div>
        )}
      </div>
      <div className={classes.section1}></div>
      {isLoading ? (
        <LoadingBox />
      ) : filteredList.length > 0 ? (
        <TutorRequestTable {...tutorRequestTableProps} />
      ) : (
        <ErrorBox />
      )}
    </main>
  );
};

export default TutorRequest;

const styles = {
  dropDownStyles: {
    minWidth: "320px",
    flex: "1",
    background: "var(--main-white-color)",
  },
};
