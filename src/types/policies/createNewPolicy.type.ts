export type CreateNewPolicy_Api_Payload = {
  title: string;
  policy_content: string;
  assigned_to: string;
  category: string;
};

export type CreateNewPolicy_Api_Response = {
  success: boolean;
  data: {
    id: number;
    title: string;
    policy_content: string;
    assign_to: string;
    category: string;
    updatedAt: Date;
    createdAt: Date;
  };
  message: string;
};
