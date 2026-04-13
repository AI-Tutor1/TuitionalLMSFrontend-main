import React from "react";
import { memo } from "react";
import ResourcesComponents from "@/components/ui/superAdmin/resources/resource-components/resource-components";
import { Subject_Type } from "@/services/dashboard/superAdmin/curriulums/curriulums.type";

interface SubjectProps {
  deleteModalToggle: (id: number) => void;
  updateModalToggle: (id: number) => void;
  data: Subject_Type[];
}
const Subject: React.FC<SubjectProps> = ({
  data,
  deleteModalToggle,
  updateModalToggle,
}) => {
  return (
    <>
      {data?.map((item: Subject_Type) => (
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

export default memo(Subject);
