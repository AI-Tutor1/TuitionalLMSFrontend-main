export type CreatePage_Api_Payload = {
  name: string;
  route: string;
  order: number;
  icon: File | null;
  category: string;
};

export type CreatePage_Api_Response = {
  success: boolean;
};
