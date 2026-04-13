export type GetAllPolicies_Api_Response = {
  success: boolean;
  message: string;
  data: [
    {
      id: number;
      title: "string";
      policy_content: "string";
      assigned_to: "string";
      created_by: string;
      category: "string";
      createdAt: Date;
      updatedAt: Date;
    }
  ];
};

export type GetAllPolicies_Api_Filters = {
  title?: string;
  category?: string;
  assignedTo?: string;
};
