import { useState, useCallback, CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PaginationComponent from "@/components/global/pagination/pagination";
import classes from "./billing-table.module.css";
import moment from "moment";
import { imageUrl } from "@/utils/helpers/image-url-parsing";
import LoadingBox from "@/components/global/loading-box/loading-box";
import defaultClasses from "@/styles/table-styles.module.css";
import { useParams } from "next/navigation";
import { Tooltip } from "@mui/material";
import { useAppSelector } from "@/lib/store/hooks/hooks";

interface BillingTablesProps {
  data: any;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  handleGetInvoice?: any;
  handleGetInvoiceV1?: any;
  invoiceLoading?: boolean;
  invoiceLoadingV1?: boolean;
  handleEditModal?: any;

  isLoading?: boolean;
  handleSwitch?: any;
  inlineStyling?: CSSProperties;
}

interface Column {
  id: number;
  name: string;
  width: string;
}

const headData = [
  { id: 0, name: "User_id", width: "10%" },
  { id: 1, name: "User Profile", width: "20%" },
  { id: 2, name: "Current Balance", width: "15%" },
  { id: 3, name: "Balance Status", width: "15%" },
  { id: 4, name: "Created At", width: "15%" },
  { id: 5, name: "Updated At", width: "15%" },
  { id: 6, name: "Actions", width: "10%" },
];

export default function BillingTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  isLoading,
  handleGetInvoice,
  invoiceLoading,
  handleGetInvoiceV1,
  invoiceLoadingV1,
  handleEditModal,

  inlineStyling,
}: BillingTablesProps) {
  const router = useRouter();
  const { role } = useParams();
  const { user, token } = useAppSelector((state) => state?.user);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [icon, setIcon] = useState<string>("");

  // Memoize route handling function
  const handleRoute = useCallback(
    (id: number, event: React.MouseEvent) => {
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey) {
        window.open(`/${role}/transaction-details/${id}`, "_blank");
      } else {
        router.push(`/${role}/transaction-details/${id}`);
      }
    },
    [router, role],
  );

  return (
    <div className={defaultClasses.tableContainer} style={inlineStyling}>
      <div className={defaultClasses.tableChild}>
        <div className={defaultClasses.tableHead}>
          {headData?.map((item: Column) => (
            <div
              className={defaultClasses.tableHeadCell}
              key={item.id}
              style={{
                width: item.width,
              }}
            >
              {item.name}
            </div>
          ))}
        </div>

        <div className={defaultClasses.tableBody}>
          {data?.map((item: any, indx: number) => {
            return (
              <div
                key={indx}
                className={defaultClasses.tableRow}
                onClick={(e) => handleRoute(item.user_id, e)}
              >
                <div
                  className={defaultClasses.tableCell}
                  style={{ width: headData[0].width }}
                >
                  {item?.user?.id ? item?.user?.id : "Null"}
                </div>

                <div
                  className={defaultClasses.tableCell}
                  style={{
                    width: headData[1].width,
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <div className={classes.imageBox}>
                    <Image
                      src={imageUrl(item?.user?.profileImageUrl)}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className={classes.roleBox}>
                    <span>
                      {item?.user?.name ? item?.user?.name : "No Show"}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "max-content",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        color:
                          item?.user?.role?.id === 1
                            ? "var(--red-color2)"
                            : item?.user?.role?.id === 2
                              ? "var(--red-color2)"
                              : item?.user?.role?.id === 3
                                ? "var(--green-text-color3)"
                                : item?.user?.role?.id === 4
                                  ? "var(--red-color2)"
                                  : item?.user?.role?.id === 5
                                    ? "var(--purple-text-color1)"
                                    : "var(--red-color2)",
                        backgroundColor:
                          item?.user?.role?.id === 1
                            ? "var(--red-background-color2)"
                            : item?.user?.role?.id === 2
                              ? "var(--red-background-color2)"
                              : item?.user?.role?.id === 3
                                ? "var(--green-background-color4)"
                                : item?.user?.role?.id === 4
                                  ? "var(--orange-background-color1)"
                                  : item?.user?.role?.id === 5
                                    ? "var(--purple-background-color1)"
                                    : "var(--red-background-color2)",
                      }}
                    >
                      {item?.user?.role?.name || "No Show"}
                    </span>
                  </div>
                </div>

                <div
                  className={defaultClasses.tableCell}
                  style={{ width: headData[2].width }}
                >
                  {item?.current_balance ? item?.current_balance : "0"}
                </div>

                <div
                  className={`${defaultClasses.tableCell} ${classes.balanceStatus}`}
                  style={{ width: headData[3].width }}
                >
                  <span
                    style={{
                      color:
                        item?.user?.balance_status === "SUFFICIENT"
                          ? "#286320"
                          : item?.user?.balance_status === "INSUFFICIENT"
                            ? "#653838"
                            : "",
                      backgroundColor:
                        item?.user?.balance_status === "SUFFICIENT"
                          ? "#A0FFC0"
                          : item?.user?.balance_status === "INSUFFICIENT"
                            ? "#FFACAC"
                            : "",
                      padding: "5px 10px",
                      borderRadius: "5px",
                    }}
                  >
                    {item?.user?.balance_status
                      ? item?.user?.balance_status
                      : "Not Calculated"}
                  </span>
                </div>

                <div
                  className={defaultClasses.tableCell}
                  style={{ width: headData[4].width }}
                >
                  {item?.createdAt
                    ? moment.utc(item?.createdAt).local().format("Do-MMM-YYYY")
                    : "No Show"}
                </div>

                <div
                  className={defaultClasses.tableCell}
                  style={{ width: headData[5].width }}
                >
                  {item?.updatedAt
                    ? moment.utc(item?.updatedAt).local().format("Do-MMM-YYYY")
                    : "No Show"}
                </div>

                <div
                  className={defaultClasses.tableCell}
                  style={{
                    width: headData[6].width,
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  {/* Action 1: Normal Invoice */}
                  {(icon === "true" || icon === "v1") && // V1 also uses true/false for pierc, but we can use icon state to distinguish
                  invoiceLoading &&
                  invoiceId === item?.user_id ? (
                    <LoadingBox
                      loaderStyling={{
                        height: "4vh !important",
                        width: "4vh !important",
                      }}
                      inlineStyling={{ justifyContent: "flex-start" }}
                    />
                  ) : (
                    <div className={classes.iconsContainer}>
                      <Tooltip
                        title={"Generate Invoice"}
                        placement="bottom"
                        arrow
                      >
                        <span
                          className={defaultClasses.iconBox}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            setInvoiceId(item?.user_id);
                            setIcon("true");
                            handleGetInvoice(e, item?.user_id, true);
                          }}
                        >
                          <Image
                            src="/assets/svgs/menuBarIcons/invoice.svg"
                            alt="delete"
                            width={0}
                            height={0}
                            style={{
                              width: "var(--regular18-)",
                              height: "var(--regular18-)",
                            }}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  )}
                  {icon === "false" &&
                  invoiceLoading &&
                  invoiceId === item?.user_id ? (
                    <LoadingBox
                      loaderStyling={{
                        height: "4vh !important",
                        width: "4vh !important",
                      }}
                      inlineStyling={{ justifyContent: "flex-start" }}
                    />
                  ) : (
                    <div className={classes.iconsContainer}>
                      <Tooltip
                        title={"Generate Invoice 20%"}
                        placement="bottom"
                        arrow
                      >
                        <span
                          className={defaultClasses.iconBox}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            setInvoiceId(item?.user_id);
                            setIcon("false");
                            handleGetInvoice(e, item?.user_id, false);
                          }}
                        >
                          <Image
                            src="/assets/svgs/menuBarIcons/invoice.svg"
                            alt="delete"
                            width={0}
                            height={0}
                            style={{
                              width: "var(--regular18-)",
                              height: "var(--regular18-)",
                            }}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  )}

                  {/* Action 3: V1 Invoice */}
                  {icon === "v1" &&
                  invoiceLoadingV1 &&
                  invoiceId === item?.user_id ? (
                    <LoadingBox
                      loaderStyling={{
                        height: "4vh !important",
                        width: "4vh !important",
                      }}
                      inlineStyling={{ justifyContent: "flex-start" }}
                    />
                  ) : (
                    <div className={classes.iconsContainer}>
                      <Tooltip
                        title={"Generate Invoice V1"}
                        placement="bottom"
                        arrow
                      >
                        <span
                          className={defaultClasses.iconBox}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            setInvoiceId(item?.user_id);
                            setIcon("v1");
                            handleGetInvoiceV1(e, item?.user_id, true);
                          }}
                        >
                          <Image
                            src="/assets/svgs/menuBarIcons/billing.svg"
                            alt="v1 invoice"
                            width={0}
                            height={0}
                            style={{
                              width: "var(--regular18-)",
                              height: "var(--regular18-)",
                            }}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage || 0}
        rowsPerPage={rowsPerPage || 0}
        totalEntries={totalCount || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 100, 200]}
        inlineStyles={{
          padding: "5px 10px",
          borderTop: "1px solid var(--color-dashboard-border)",
        }}
      />
    </div>
  );
}
