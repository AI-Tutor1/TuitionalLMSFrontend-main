// Get_All_Billing_ApiResponse_Type
interface User {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
}

interface DataItem {
  id: number;
  user: User;
}

// Filter_Options_Billing_ApiResponse_Type
export type Billing_Api_FilterOptions = {
  page: number;
  limit: number;
  user_id?: string;
  roleId?: string;
  balanceStatus?: string;
  isBelow?: boolean;
  status?: boolean;
};

export type Get_All_Billing_ApiResponse_Type = {
  data: DataItem[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

// Create_New_Billing_Payload_Type
export type Create_New_Billing_Payload_Type = {
  user_id: number;
  amount: number;
  enrollment_id?: number;
  status: string;
  type: string;
};

interface Billing {
  id: number;
  user_id: number;
  current_balance: number;
  createdAt: Date;
  updatedAt: Date;
  enrollment_id: number | null;
}

interface Transaction {
  id: number;
  current_balance: number;
  status: "1" | "2" | "3";
  remaining_balance: number;
  cost: number;
  type: "Credit" | "Debit";
  user_id: number;
  billing_id: number;
  updatedAt: Date;
  createdAt: Date;
}

// Create_New_Billing_ApiResponse_Type
export type Create_New_Billing_ApiResponse_Type =
  | {
      billing: Billing;
      transaction: Transaction;
    }
  | { error: string };

export type GetBillingWithUserId_Response_Type = {
  id: number;
  user_id: number;
  current_balance: number;
  createdAt: string;
  updatedAt: string;
  enrollment_id: null;
  user: {
    name: string;
    id: number;
    email: string;
    profileImageUrl: string;
    country_code: string;
  };
}[];
