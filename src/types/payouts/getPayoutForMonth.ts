export type GetTutorPayoutsApi_Params_Type = {
  month?: number | null;
  year?: number | string;
  limit?: number | null;
  page?: number | null;
  search?: string;
  status?: string;
  exportData?: boolean;
};

export type Payouts_List = {
  id: number;
  tutor_id: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  total_sessions: number;
  balance: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userPayout: {
    id: number;
    name: string;
    email: string;
    connectedEmails: string | null;
    password: string;
    status: boolean;
    is_verified: boolean;
    isSync: boolean;
    firebase_token: string;
    token: string;
    roleId: number;
    reset_token: string | null;
    city: string | null;
    gender: string | null;
    country: string | null;
    profileImageUrl: string;
    pseudo_name: string;
    pseudo_names: string | null;
    phone_number: string | null;
    country_code: string | null;
    reset_token_expiry: string | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  sessionSummary: {
    enrollment_id: number | null;
    tutor_hourly_rate: number | null;
    name: string;
    session_count: number;
    conclusion_type: string;
    duration: number;
  }[];
};

// Main response structure
export type GetPayoutsForMonth_Api_Response_Type = {
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  payouts: Payouts_List[];
};
