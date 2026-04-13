// Resource object type for filters
export type ResourceObject = {
  id: number;
  name: string;
  [key: string]: any; // Allow for additional properties
};

// API parameter type (for actual API calls)
export type GetAllNewUserInvoices_Api_Params_Type = {
  limit: number;
  page: number;
  search: string;
  student_gender: string;
  parent_gender: string;
  board_id: number | null;
  curriculum_id: number | null;
  subject_id: number | null;
  grade_id: number | null;
};

// Component filter type (for UI state management)
export type LeadsFilterState = {
  limit: number;
  page: number;
  search: string;
  student_gender: string;
  parent_gender: string;
  board_id: ResourceObject | null;
  curriculum_id: ResourceObject | null;
  subject_id: ResourceObject | null;
  grade_id: ResourceObject | null;
};

export type Lead = {
  id: number;
  student_name: string;
  parent_name: string;
  student_contact: string;
  parent_contact: string;
  student_email: string;
  parent_email: string;
  student_gender: string;
  parent_gender: string;
  subject_id: number;
  board_id: number;
  curriculum_id: number;
  grade_id: number;
  hourly_rate: number;
  no_of_classes: number;
  registration_fee: number;
  due_date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type LeadsPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type GetAllNewUserInvoices_Api_Response_Type =
  | {
      success: boolean;
      message: string;
      data: {
        leads: Lead[];
        pagination: LeadsPagination;
      };
    }
  | {
      success: boolean;
      message: string;
    };

export type GenerateNewUserInvoice_Api_Payload_Type = {
  student_name: string;
  parent_name: string;
  student_contact: string;
  parent_contact: string;
  student_email: string;
  parent_email: string;
  student_gender: string;
  parent_gender: string;
  lms_fee: number;
  registration_fee: number;
  due_date: string;
  country: string;
  enrollments: {
    subject_id: number;
    hourly_rate: number;
    board_id: number;
    curriculum_id: number;
    grade_id: number;
    no_of_classes: number;
  }[];
};

export type GenerateNewUserInvoice_Api_Response_Type = {
  success: boolean;
  message: string;
  data: {
    id: number;
    student_name: string;
    parent_name: string;
    student_contact: string;
    parent_contact: string;
    student_email: string;
    parent_email: string;
    student_gender: string;
    parent_gender: string;
    registration_fee: number;
    due_date: string;
    country: string;
    updatedAt: string;
    createdAt: string;
    totalFee: number;
    invoice: {
      id: number;
      user_id: number | null;
      amount: number;
      due_date: string;
      status: string;
      pdf_content: string;
      amount_paid: number | null;
      payment_link: string;
      updatedAt: string;
      createdAt: string;
    };
  };
};
