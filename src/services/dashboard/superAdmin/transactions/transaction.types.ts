interface Transactions {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
}

export type DataItem = {
  id?: number;
  session_id?: number;
  current_balance?: number;
  enrollment_id?: number;
  status?: boolean;
  remaining_balance?: number;
  cost?: number;
  type?: string;
  user_id?: number;
  createdAt?: string;
  billing_id?: number;
  updatedAt?: string;

  isReverted?: boolean;
  session_date?: string;
  deletedAt?: string | null;
  sessionTransaction?: { conclusion_type: string } | null;
  transactions?: Transactions;
  enrollment: {
    id: number;
    status: number;
    hourly_rate: number;
    request_rate: number;
    tutor_hourly_rate: number;
    group_id: string;
    createdAt: string;
    on_break: boolean;
    tutor: {
      name: string;
      id: number;
      email: string;
      profileImageUrl: string;
      country_code: string;
    };
    subject: {
      id: number;
      name: string;
    };
    curriculum: {
      id: number;
      name: string;
    };
    board: {
      id: number;
      name: string;
    };
    grade: {
      id: number;
      name: string;
    };
    studentsGroups: Array<{
      id: number;
      group_id: string;
      student_id: number;
      enrollment_id: number;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      StudentId: number | null;
      user: {
        name: string;
        id: number;
        email: string;
        profileImageUrl: string;
        country_code: string;
      };
    }>;
  };
};

export type Get_All_Transactions_ApiResponse = {
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  data: DataItem[];
};

export type Transaction_Api_FilterOptions = {
  start_time?: string;
  end_time?: string;
  type?: string;
  limit?: number | null;
  page?: number | null;
  user_id?: string;
  conclusion_type?: string;
  session_id?: string;
  sort_by?: "session_date" | "createdAt";
};
