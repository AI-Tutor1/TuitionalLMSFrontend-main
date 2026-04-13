import React, { memo } from "react";
import ResourcesComponents from "@/components/ui/superAdmin/resources/resource-components/resource-components";
import { Board_Type } from "@/services/dashboard/superAdmin/curriulums/curriulums.type";

interface BoardProps {
  deleteModalToggle: (id: number) => void;
  updateModalToggle: (id: number) => void;
  data: Board_Type[];
}

const Board: React.FC<BoardProps> = ({
  data,
  deleteModalToggle,
  updateModalToggle,
}) => {
  return (
    <>
      {data?.map((item: Board_Type) => (
        <ResourcesComponents
          key={item.id}
          name={item.name}
          createdAt={item.createdAt}
          id={item.id}
          updateModalToggle={updateModalToggle}
          deleteModalToggle={deleteModalToggle}
        />
      ))}
    </>
  );
};

export default memo(Board);
