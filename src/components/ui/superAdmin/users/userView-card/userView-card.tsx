import { memo, useCallback, CSSProperties } from "react";
import classes from "./userView-card.module.css";
import BasicSwitches from "@/components/global/toggle-button/toggle-button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User_Object_Type } from "@/services/dashboard/superAdmin/users/users.type";
import PaginationComponent from "@/components/global/pagination/pagination";
import moment from "moment";
import { useParams } from "next/navigation";
import { Tooltip } from "@mui/material";

interface UsersTablesProps {
  data?: User_Object_Type[];
  handleDeactivateModal: any;
  handleDeleteModal: any;
  handleEditModal?: any;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  isLoading?: boolean;
  inlineStyling?: CSSProperties;
}

const UserViewCard: React.FC<UsersTablesProps> = ({
  currentPage,
  totalPages,
  totalCount,
  data,
  handleDeactivateModal,
  handleDeleteModal,
  handleEditModal,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  isLoading,
  inlineStyling,
}) => {
  const { role } = useParams();
  const router = useRouter();

  const handleRoute = useCallback(
    (id: number, roleId: number, event: React.MouseEvent) => {
      const targetPath = `/${role}/counselling/${id}?roleId=${roleId}`;
      if (event.ctrlKey || event.metaKey) {
        window.open(targetPath, "_blank");
      } else {
        router.push(targetPath);
      }
    },
    [router, role],
  );

  return (
    <div className={classes.mobileViewContainer} style={inlineStyling}>
      <div className={classes.scrollBox}>
        {data?.map((item, index) => {
          const {
            id,
            profileImageUrl,
            name,
            roleId,
            email,
            status,
            createdAt,
            isSync,
            pseudo_name,
          } = item;

          return (
            <div className={classes.container} key={item?.id || index}>
              <div className={classes.header}>
                <div className={classes.status}>
                  <span className={classes.date}>User_id: {id}</span>
                </div>
                <span className={classes.date}>
                  {item?.createdAt
                    ? moment.utc(createdAt).local().format("Do-MMM-YYYY")
                    : "N/A"}
                </span>
              </div>
              <div className={classes.profileSection}>
                <div className={classes.field}>
                  <h4 className={classes.label}>Tutor</h4>
                  <div className={classes.profile}>
                    <div className={classes.imageBox}>
                      <Image
                        src={profileImageUrl || "/assets/images/dummyPic.png"}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <span className={classes.nameBox}>
                      <span>{`${name
                        .trim()
                        .split(" ")
                        .slice(0, 2)
                        .join(" ")}`}</span>
                      <span>{`${pseudo_name}`}</span>
                    </span>
                  </div>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Email</span>
                  <span className={classes.value}>{email || "No Show"}</span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Active</span>
                  <div
                    style={{
                      padding: "8px",
                      borderRadius: "100%",
                      width: "max-content",
                      backgroundColor:
                        status === true
                          ? "var(--green-color)"
                          : "var(--red-color1)",
                    }}
                  ></div>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Role</span>
                  <span
                    className={classes.value}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "max-content",
                      padding: "2.5px 5px",
                      borderRadius: "5px",
                      textAlign: "center",
                      color:
                        roleId === 1
                          ? "var(--red-color2)"
                          : roleId === 2
                            ? "var(--red-color2)"
                            : roleId === 3
                              ? "var(--green-text-color1)"
                              : roleId === 4
                                ? "var(--red-color2)"
                                : roleId === 5
                                  ? "var(--purple-text-color1)"
                                  : roleId === 6
                                    ? "var(--orange-text-color1)"
                                    : "var(--red-color2)",
                      backgroundColor:
                        roleId === 1
                          ? "var(--red-background-color2)"
                          : roleId === 2
                            ? "var(--red-background-color2)"
                            : roleId === 3
                              ? "var(--green-background-color3)"
                              : roleId === 4
                                ? "var(--orange-background-color1)"
                                : roleId === 5
                                  ? "var(--purple-background-color1)"
                                  : roleId === 6
                                    ? "--orange-background-color1"
                                    : "var(--red-background-color2)",
                    }}
                  >
                    {item?.role?.name}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Sync</span>
                  <span
                    className={classes.value}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "max-content",
                      padding: "2.5px 5px",
                      borderRadius: "5px",
                      textAlign: "center",
                      color:
                        isSync === true
                          ? "var(--green-text-color1)"
                          : "var(--red-text-color2)",
                      backgroundColor:
                        isSync === true
                          ? " var(--green-background-color1)"
                          : "var(--red-background-color1)",
                    }}
                  >
                    {isSync === true ? "Synced" : "Unsynced"}
                  </span>
                </div>
                <div className={classes.field}>
                  <span className={classes.label}>Actions</span>
                  <div className={classes.iconsContainer}>
                    <Tooltip
                      title={"Activate/Deactivate"}
                      placement="bottom"
                      arrow
                    >
                      <span
                        className={classes.iconBox}
                        onClick={(e: any) => handleDeactivateModal(e, item)}
                      >
                        <Image
                          src="/assets/svgs/active1.svg"
                          alt="edit"
                          width={0}
                          height={0}
                          style={{
                            width: "var(--regular18-)",
                            height: "var(--regular18-)",
                          }}
                        />
                      </span>
                    </Tooltip>
                    <Tooltip title={"Update"} placement="bottom" arrow>
                      <span
                        className={classes.iconBox}
                        onClick={(e: any) => handleEditModal(e, item)}
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
                    </Tooltip>
                    <Tooltip title={"Delete"} placement="bottom" arrow>
                      <span
                        className={classes.iconBox}
                        onClick={(e: any) => handleDeleteModal(e, id)}
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
                    </Tooltip>
                    <Tooltip title={"Counselling"} placement="bottom" arrow>
                      <span
                        className={classes.iconBox}
                        onClick={(event) => handleRoute(id, roleId, event)}
                      >
                        <Image
                          src="/assets/svgs/counselling.svg"
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage || 0}
        rowsPerPage={rowsPerPage || 0}
        totalEntries={totalCount || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 100, 200, 300]}
        inlineStyles={{ padding: "10px", width: "100%" }}
      />
    </div>
  );
};

export default UserViewCard;
