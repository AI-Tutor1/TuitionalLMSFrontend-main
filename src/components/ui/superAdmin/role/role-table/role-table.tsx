import { CSSProperties } from "react";
import Image from "next/image";
import classes from "./role-table.module.css";
import moment from "moment";
import { getAllRoles_Api_Response_Type } from "@/types/roles/getAllRoles.type";

interface Column {
  id: number;
  name: string;
  width: string;
}

const headData: Column[] = [
  { id: 1, name: "Id", width: "15%" },
  { id: 2, name: "Role Name", width: "20%" },
  { id: 3, name: "Created At", width: "25%" },
  { id: 4, name: "Updated At", width: "20%" },
  { id: 5, name: "Actions", width: "20%" },
];

interface RoleTablesProps {
  data?: getAllRoles_Api_Response_Type | [];
  onDeleteClick?: (id: number) => void;
  onEditClick?: (item: any) => void;
  onAssignPage?: (item: any) => any;
  inlineStyling?: CSSProperties;
}

export default function RoleTable({
  data = [],
  onDeleteClick,
  onEditClick,
  onAssignPage,
  inlineStyling,
}: RoleTablesProps) {
  // Handle empty data
  const roles = Array.isArray(data) ? data : [];

  return (
    <div className={classes.table} style={inlineStyling}>
      <div className={classes.tableChild}>
        <div className={classes.tableHead}>
          {headData?.map((item: Column) => (
            <div
              className={classes.tableHeadCell}
              key={item.id}
              style={{
                width: item.width,
              }}
            >
              {item.name}
            </div>
          ))}
        </div>

        <div className={classes.tableBody}>
          {roles.length === 0 ? (
            <div className={classes.tableRow}>
              <div
                className={classes.tableCell}
                style={{
                  width: "100%",
                  textAlign: "center",
                  padding: "20px",
                  color: "#666",
                }}
              >
                No roles found
              </div>
            </div>
          ) : (
            roles.map((item: any, indx: number) => {
              return (
                <div key={item.id || indx} className={classes.tableRow}>
                  {/* Role ID */}
                  <div
                    className={classes.tableCell}
                    style={{ width: headData[0]?.width }}
                  >
                    {item?.id || "N/A"}
                  </div>

                  {/* Role Name */}
                  <div
                    className={classes.tableCell}
                    style={{ width: headData[1]?.width }}
                  >
                    {item?.name || "N/A"}
                  </div>

                  {/* Created At */}
                  <div
                    className={classes.tableCell}
                    style={{ width: headData[2]?.width }}
                  >
                    {item?.createdAt
                      ? moment.utc(item.createdAt).format("Do MMMM YYYY")
                      : "N/A"}
                  </div>

                  {/* Updated At */}
                  <div
                    className={classes.tableCell}
                    style={{ width: headData[3]?.width }}
                  >
                    {item?.updatedAt
                      ? moment.utc(item.updatedAt).format("Do MMMM YYYY")
                      : "N/A"}
                  </div>

                  {/* Actions */}
                  <div
                    className={classes.tableCell}
                    style={{ width: headData[4]?.width }}
                  >
                    <div className={classes.iconsContainer}>
                      <span
                        className={classes.iconBox}
                        onClick={() => onEditClick?.(item)}
                        title="Edit Role"
                      >
                        <Image
                          src="/assets/svgs/edit.svg"
                          alt="edit"
                          width={0}
                          height={0}
                          style={{
                            width: "var(--regular18-)",
                            height: "var(--regular18-)",
                          }}
                        />
                      </span>
                      <span
                        className={classes.iconBox}
                        onClick={() => onDeleteClick?.(item.id)}
                        title="Delete Role"
                      >
                        <Image
                          src="/assets/svgs/delete.svg"
                          alt="delete"
                          width={0}
                          height={0}
                          style={{
                            width: "var(--regular18-)",
                            height: "var(--regular18-)",
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
