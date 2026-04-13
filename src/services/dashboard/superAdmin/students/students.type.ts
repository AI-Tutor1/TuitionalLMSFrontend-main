// URL Payload
export type GetAllStudents_Api_Payload_Type = {
  startDate?: string;
  endDate?: string;
  userType?: number | null;
  name?: string;
  email?: string;
  countryCode?: string;
  page?: number | null;
  limit?: number | null;
};

// Get Api Response
export type Student_Data = {
  id: number;
  name: string;
  email: string;
  password: string;
  status: boolean;
  is_verified: boolean;
  firebase_token: string;
  token: string | null;
  roleId: number;
  reset_token: string | null;
  city: string | null;
  gender: string;
  country: string | null;
  profileImageUrl: string;
  pseudo_name: string;
  phone_number: string;
  country_code: string;
  reset_token_expiry: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type GetAllStudents_Api_Response = {
  users: Student_Data[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};
