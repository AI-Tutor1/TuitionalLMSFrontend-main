export type Curriculum_Type = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Board_Type = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Subject_Type = {
  id: number;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Grade_Type = {
  id: number;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ResourceGetAll_ApiResponse_Type = {
  curriculum: Curriculum_Type[];
  board: Board_Type[];
  subject: Subject_Type[];
  grades: Grade_Type[];
};

export type ResourceDelte_ApiResponse_Type = { error: string; message: string };

export type ResourceAdd_ApiResponse_Type = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ResourceUpdate_ApiResponse_Type = {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
