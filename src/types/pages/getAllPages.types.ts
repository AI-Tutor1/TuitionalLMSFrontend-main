export type GetAllPages_Api_Request_Type_Data = [
  {
    id: number;
    name: string;
    route: string;
    icon: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: null | Date;
  }
];

export type GetAllPages_Api_Response_Type = {
  success: boolean;
  pages: GetAllPages_Api_Request_Type_Data;
};
