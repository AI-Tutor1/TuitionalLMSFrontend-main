"use client";
import { useMemo, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Box } from "@mui/material";
import classes from "./transactions-details.module.css";
import ErrorBox from "@/components/global/error-box/error-box";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllTransactions } from "@/services/dashboard/superAdmin/transactions/transactions";
import { getAllBillingsWithUserId } from "@/services/dashboard/superAdmin/billing/billing";
import { MyAxiosError } from "@/services/error.type";
import { toast } from "react-toastify";
import moment from "moment";
import PaginationComponent from "@/components/global/pagination/pagination";
import LoadingBox from "@/components/global/loading-box/loading-box";

const headData: { id: number; name: string; width: string }[] = [
  { id: 1, name: "Enroll_Id", width: "10%" },
  { id: 2, name: "Session_Id", width: "10%" },
  { id: 3, name: "User Profile", width: "18%" },
  { id: 4, name: "Email Address", width: "20%" },
  { id: 5, name: "Session Date", width: "15%" },
  { id: 6, name: "Transactions", width: "27%" },
];

const TransactionDetails = () => {
  const { id } = useParams() as { id: string };
  const token = useAppSelector((state) => state?.user?.token);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);

  const handleChangePage = useCallback((e: any, newPage: number) => {
    setCurrentPage(newPage);
  }, []);
  const handleChangeRowsPerPage = useCallback((e: any) => {
    setRowsPerPage(e?.target?.value);
  }, []);

  const {
    data: transactionData,
    error: transactionError,
    isLoading: isLoadingTransactions,
  } = useQuery({
    queryKey: ["getAllTransactions", token, currentPage, rowsPerPage],
    queryFn: () =>
      getAllTransactions(
        { user_id: String(id), limit: rowsPerPage, page: currentPage },
        { token },
      ),
    enabled: !!token,
  });

  const {
    data: billingWithUserIdData,
    error: billingWithUserIdDataError,
    isLoading: billingWithUserIdDataLoading,
  } = useQuery({
    queryKey: ["getAllBillingsWithUserId", token, currentPage, rowsPerPage],
    queryFn: () => getAllBillingsWithUserId(id, { token }),
    enabled: !!token,
  });

  // Calculate totals for debit and credit transactions
  const { totalDebit, totalCredit, netTotal } = useMemo(() => {
    if (!transactionData?.data?.length) {
      return { totalDebit: 0, totalCredit: 0, netTotal: 0 };
    }

    const totals = transactionData.data.reduce(
      (acc: any, item: any) => {
        const cost = parseFloat(item?.cost) || 0;
        if (item?.type === "Debit") {
          acc.totalDebit += cost;
        } else if (item?.type === "Credit") {
          acc.totalCredit += cost;
        }
        return acc;
      },
      { totalDebit: 0, totalCredit: 0 },
    );

    return {
      ...totals,
      netTotal: totals.totalCredit - totals.totalDebit,
    };
  }, [transactionData?.data]);

  useEffect(() => {
    if (transactionError || billingWithUserIdDataError) {
      const axiosError = (transactionError ||
        billingWithUserIdDataError) as MyAxiosError;
      if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error(axiosError.message);
      }
    }
  }, [transactionError, billingWithUserIdDataError]);

  return (
    <Box className={classes.transactionsBox}>
      <div className={classes.tableHead}>
        {headData.map((item) => (
          <div
            className={classes.tableHeadCell}
            key={item.id}
            style={{ width: item.width }}
          >
            {item.name}
          </div>
        ))}
      </div>

      <div className={classes.tableBox}>
        {isLoadingTransactions ? (
          <LoadingBox />
        ) : transactionData && transactionData?.data?.length > 0 ? (
          <>
            {transactionData?.data?.map((item: any, index: number) => {
              const isStudent =
                item?.user_id ===
                item?.enrollment?.studentsGroups?.[0]?.user?.id;
              return (
                <Box key={item.id || index} className={classes.transactions}>
                  {/* Enroll_Id - Index 0 */}
                  <p style={{ width: headData[0].width }}>
                    {item?.enrollment_id || "Null"}
                  </p>

                  {/* Session_Id - Index 1 */}
                  <p style={{ width: headData[1].width }}>
                    {item?.session_id || "Null"}
                  </p>

                  {/* User Profile - Index 2 */}
                  <div
                    className={classes.userProfile}
                    style={{ width: headData[2].width }}
                  >
                    <span className={classes.imageBox}>
                      <Image
                        src={
                          item?.transactions?.profileImageUrl ||
                          "/assets/images/demmyPic.png"
                        }
                        alt={item?.transactions?.name || "User"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </span>
                    <span className={classes.profileContainer}>
                      {item?.transactions?.name
                        ? item.transactions.name.trim()
                        : "No Show"}
                      {item?.session_id && (
                        <span
                          className={classes.role}
                          style={{
                            backgroundColor: isStudent ? "#E0F7FA" : "#FFF3E0",
                            color: isStudent ? "#00796B" : "#E65100",
                          }}
                        >
                          {isStudent ? "Student" : "Teacher"}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Email Address - Index 3 */}
                  <p style={{ width: headData[3].width }}>
                    {item?.transactions?.email || "No Email"}
                  </p>

                  {/* Session Date - Index 4 */}
                  <p style={{ width: headData[4].width }}>
                    {moment.utc(item.session_date).format("Do-MM-YYYY")}
                  </p>

                  {/* Transactions - Index 5 */}
                  <div
                    className={classes.transactionDetails}
                    style={{ width: headData[5].width }}
                  >
                    <span className={classes.cost}>{item?.cost ?? "0"} </span>
                    <span
                      style={{
                        background:
                          item?.type === "Debit" ? "#F84F31" : "#23C552",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        color: "var(--white-color)",
                        width: "max-content",
                        textAlign: "center",
                      }}
                    >
                      {item?.type || "No Show"}
                    </span>
                    <span className={classes.cost}>
                      {moment.utc(item.createdAt).format("Do-MM-YYYY| HH:mm a")}
                    </span>
                  </div>
                </Box>
              );
            })}
          </>
        ) : (
          <ErrorBox />
        )}
      </div>

      {/* Total Section - Outside of tableBox */}
      {transactionData && transactionData?.data?.length > 0 && (
        <Box className={classes.totalSection}>
          <div>
            Total Transactions:{" "}
            <span
              style={{
                color: "#23C552",
              }}
            >
              {transactionData?.data?.length}
            </span>
          </div>
          <div>
            Net Total:
            <span
              style={{
                color:
                  billingWithUserIdData &&
                  billingWithUserIdData?.[0]?.current_balance >= 0
                    ? "#23C552"
                    : "#F84F31",
              }}
            >
              {" "}
              {billingWithUserIdDataLoading ? (
                <LoadingBox
                  loaderStyling={{
                    width:
                      "clamp(0.875rem, 0.804rem + 0.357vw, 1.125rem) !important",
                    height:
                      "clamp(0.875rem, 0.804rem + 0.357vw, 1.125rem) !important",
                  }}
                />
              ) : (
                billingWithUserIdData?.[0]?.current_balance || null
              )}
            </span>
          </div>
        </Box>
      )}
      <PaginationComponent
        totalPages={transactionData?.totalPages}
        page={transactionData?.currentPage || 0}
        rowsPerPage={rowsPerPage || 0}
        totalEntries={transactionData?.totalTransactions || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 100, 200]}
        inlineStyles={{ padding: "15px" }}
      />
    </Box>
  );
};

export default TransactionDetails;
