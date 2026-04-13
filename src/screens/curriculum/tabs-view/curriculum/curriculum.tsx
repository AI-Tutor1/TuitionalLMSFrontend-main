import React, { memo } from "react";
import ResourcesComponents from "@/components/ui/superAdmin/resources/resource-components/resource-components";
import { Curriculum_Type } from "@/services/dashboard/superAdmin/curriulums/curriulums.type";

interface CurriculumProps {
  deleteModalToggle: (id: number) => void;
  updateModalToggle: (id: number) => void;
  data: Curriculum_Type[];
}

const Curriculum: React.FC<CurriculumProps> = ({
  data,
  deleteModalToggle,
  updateModalToggle,
}) => {
  return (
    <>
      {data?.map((item: Curriculum_Type) => (
        <ResourcesComponents
          id={item.id}
          key={item.id}
          name={item.name}
          createdAt={item.createdAt}
          deleteModalToggle={deleteModalToggle}
          updateModalToggle={updateModalToggle}
        />
      ))}
    </>
  );
};

export default memo(Curriculum);
