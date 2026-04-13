import React, { memo } from "react";
import ResourcesComponents from "@/components/ui/superAdmin/resources/resource-components/resource-components";
import { Grade_Type } from "@/services/dashboard/superAdmin/curriulums/curriulums.type";
interface GradeProps {
  deleteModalToggle: (id: number) => void;
  updateModalToggle: (id: number) => void;
  data: Grade_Type[];
}

const Grade: React.FC<GradeProps> = ({
  data,
  deleteModalToggle,
  updateModalToggle,
}) => {
  return (
    <>
      {data?.map((item: Grade_Type) => (
        <ResourcesComponents
          key={item.id}
          name={item.name}
          createdAt={item.createdAt}
          id={item.id}
          deleteModalToggle={deleteModalToggle}
          updateModalToggle={updateModalToggle}
        />
      ))}
    </>
  );
};

export default memo(Grade);
