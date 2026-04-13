import React, { FC, memo, useMemo } from "react";
import classes from "./table.module.css";
import moment from "moment";
import ErrorBox from "@/components/global/error-box/error-box";
import { Lead } from "@/types/leads/leads.type";

interface Column {
  id: number;
  name: string;
  width: string;
}

interface TtableProps {
  leads: Lead[];
  handleDeleteModal?: (id?: number) => void;
}

const headData: Column[] = [
  { id: 1, width: "12%", name: "Student Name" },
  { id: 2, width: "15%", name: "Student Email" },
  { id: 3, width: "12%", name: "Student Contact" },
  { id: 4, width: "12%", name: "Parent Name" },
  { id: 5, width: "12%", name: "Parent Contact" },
  { id: 6, width: "10%", name: "Hourly Rate" },
  { id: 7, width: "8%", name: "No of Classes" },
  { id: 8, width: "10%", name: "Registration Fee" },
  { id: 9, width: "9%", name: "Due Date" },
];

const Ttable: FC<TtableProps> = ({ leads = [], handleDeleteModal }) => {
  // Memoize formatted leads data to avoid recalculation on every render
  const formattedLeads = useMemo(() => {
    return leads.map((item) => ({
      ...item,
      formattedDueDate: item.due_date
        ? moment.utc(item.due_date).local().format("Do-MMM-YYYY")
        : "No Show",
      formattedStudentName:
        item.student_name?.trim().split(" ").slice(0, 2).join(" ") || "No Show",
      formattedStudentEmail:
        item.student_email?.trim().split(" ").slice(0, 2).join(" ") ||
        "No Show",
      formattedParentName:
        item.parent_name?.trim().split(" ").slice(0, 2).join(" ") || "No Show",
    }));
  }, [leads]);

  return (
    <div className={classes.table}>
      <div className={classes.tableChild}>
        <div className={classes.tableHead}>
          {headData.map((item, indx) => (
            <div
              className={classes.tableHeadCell}
              key={item.id}
              style={{ width: headData[indx]?.width }}
            >
              {item.name}
            </div>
          ))}
        </div>
        <div className={classes.tableBody}>
          {formattedLeads?.length > 0 ? (
            formattedLeads?.map((item) => (
              <div className={classes.tableRow} key={item.id}>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[0]?.width }}
                >
                  {item.formattedStudentName}
                </div>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[1]?.width }}
                >
                  {item.formattedStudentEmail}
                </div>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[2]?.width }}
                >
                  +{item?.student_contact || "No Show"}
                </div>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[3]?.width }}
                >
                  {item.formattedParentName}
                </div>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[4]?.width }}
                >
                  +{item?.parent_contact || "No Show"}
                </div>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[5]?.width }}
                >
                  AED {item?.hourly_rate || "0.00"}
                </div>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[6]?.width }}
                >
                  {item?.no_of_classes || "No Show"}
                </div>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[7]?.width }}
                >
                  AED {item?.registration_fee || "0.00"}
                </div>
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[8]?.width }}
                >
                  {item.formattedDueDate}
                </div>
              </div>
            ))
          ) : (
            <ErrorBox />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Ttable, (prevProps, nextProps) => {
  // Custom comparison for better performance - only re-render if essential props change
  return prevProps.leads === nextProps.leads;
});
