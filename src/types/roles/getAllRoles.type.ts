export type Role_Type = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type getAllRoles_Api_Response_Type = Role_Type[];
