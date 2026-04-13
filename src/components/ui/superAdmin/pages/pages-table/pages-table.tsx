import { CSSProperties, useCallback } from "react";
import Image from "next/image";
import classes from "./page-table.module.css";
import moment from "moment";
import { GetAllPages_Api_Request_Type_Data } from "@/types/pages/getAllPages.types";
import ErrorBox from "@/components/global/error-box/error-box";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import defaultClasses from "@/styles/table-styles.module.css";

interface Column {
  id: number;
  name: string;
  width: string;
}

const headData: Column[] = [
  { id: 0, name: "Id", width: "5%" },
  { id: 1, name: "Page Order", width: "10%" },
  { id: 2, name: "Role Name", width: "15%" },
  { id: 3, name: "Role Route", width: "17.5%" },
  { id: 4, name: "Category", width: "20%" },
  { id: 5, name: "Created At", width: "15%" },
  { id: 6, name: "Icon", width: "5%" },
  { id: 7, name: "Actions", width: "7.5%" },
];

interface PagesTablesProps {
  data?: GetAllPages_Api_Request_Type_Data | [];
  onDeleteClick?: (id: number) => void;
  onEditClick?: (item: any) => void;
  inlineStyling?: CSSProperties;
}

export default function PagesTable({
  data = [],
  onDeleteClick,
  onEditClick,
  inlineStyling,
}: PagesTablesProps) {
  const { role } = useParams();
  const router = useRouter();
  const roles = Array.isArray(data) ? data : [];
  const handleRoute = useCallback(
    (route: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const targetPath = `/${role}/${route}`;
      if (event.ctrlKey || event.metaKey) {
        window.open(targetPath, "_blank");
      } else {
        router.push(targetPath);
      }
    },
    [role, router],
  );
  return (
    <div className={defaultClasses.tableContainer} style={inlineStyling}>
      <div className={defaultClasses.tableChild}>
        <div className={defaultClasses.tableHead}>
          {headData?.map((item: Column) => (
            <div
              className={defaultClasses.tableHeadCell}
              key={item.id}
              style={{ width: item.width }}
            >
              {item.name}
            </div>
          ))}
        </div>

        <div className={defaultClasses.tableBody}>
          {roles.length === 0 ? (
            <ErrorBox />
          ) : (
            roles.map((item: any, indx: number) => {
              return (
                <div
                  className={defaultClasses.tableRow}
                  key={item.id || indx}
                  onClick={(event) => handleRoute(item?.route, event)}
                >
                  {/* Role ID */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: headData[0].width }}
                  >
                    {item?.id || "N/A"}
                  </p>

                  {/* Page Order */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: headData[1].width }}
                  >
                    {item?.order === null ? "N/A" : item?.order}
                  </p>

                  {/* Role Name */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: headData[2].width }}
                  >
                    {item?.name || "N/A"}
                  </p>

                  {/* Role Route */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: headData[3].width }}
                  >
                    {item?.route || "N/A"}
                  </p>

                  {/* Category */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: headData[4].width }}
                  >
                    {item?.category || "N/A"}
                  </p>

                  {/* Created At */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: headData[5].width }}
                  >
                    {item?.createdAt
                      ? moment.utc(item.createdAt).format("Do-MMMM-YYYY")
                      : "N/A"}
                  </p>

                  {/* Icon */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: headData[6].width }}
                  >
                    {item?.icon ? (
                      <Image
                        src={item.icon}
                        alt="icon"
                        width={0}
                        height={0}
                        style={{
                          width: "var(--regular16-)",
                          height: "var(--regular16-)",
                          filter: "var(--icon-filter)",
                        }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </p>

                  {/* Actions */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{ width: headData[7].width }}
                  >
                    <div className={classes.iconsContainer}>
                      <span
                        className={defaultClasses.iconBox}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick?.(item);
                        }}
                        title="Edit Role"
                      >
                        <Image
                          src="/assets/svgs/edit.svg"
                          alt="edit"
                          width={0}
                          height={0}
                          style={{
                            width: "var(--regular16-)",
                            height: "var(--regular16-)",
                          }}
                        />
                      </span>
                      <span
                        className={defaultClasses.iconBox}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick?.(item.id);
                        }}
                        title="Delete Role"
                      >
                        <Image
                          src="/assets/svgs/delete.svg"
                          alt="delete"
                          width={0}
                          height={0}
                          style={{
                            width: "var(--regular16-)",
                            height: "var(--regular16-)",
                          }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
