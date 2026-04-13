export type MonthlyExpense = {
  enrollmentName: string;
  total: number;
  hourlyRate: number;
  numberOfClasses: number;
};

export type UserInvoice = {
  userId: number;
  monthlyExpense: MonthlyExpense[];
  currentBalance: number;
  totalAmount: number;
  startDate: string; // Consider changing to Date type if parsing is needed
  endDate: string; // Consider changing to Date type if parsing is needed
  zeroBalanceDate: string | null;
};

export type GenerateUserInvoice_Api_Response = {
  userInvoices: UserInvoice[];
  message: string;
  error: string;
};

export type GetAllInvoices_Options = {
  limit?: number;
  page?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  dueStartDate?: string;
  dueEndDate?: string;
  user_id?: string;
  status?: string;
  name?: string;
  is_sent?: boolean | "";
  excel_data?: boolean;
};

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Invoice = {
  id?: number;
  user_id?: number;
  due_date?: string; // ISO string format
  status?: string; // Adjust based on possible statuses
  amount?: number;
  amount_paid?: number;
  pdf_content?: string;
  createdAt?: string; // ISO string format
  updatedAt?: string; // ISO string format
  userInvoice?: User;
  payment_link?: string;
  short_url?: string;
  is_sent?: boolean;
};

export type GetAllInvoice_Api_Response = {
  message?: string;
  totalInvoices: number;
  totalPages: number;
  currentPage: number;
  invoices: Invoice[];
};

// invoice status update types

export type Invoice_Type = {
  id: number;
  user_id: number;
  status: string;
  amount: number;
  due_date: string;
};

export type Transaction = {
  id: number;
  user_id: number;
  billing_id: number;
  status: string;
  cost: number;
  type: string;
  remaining_balance: number;
};

export type Update_Invoice_Status_Api_Response = {
  message: string;
  invoice: Invoice_Type;
  transaction: Transaction;
};

// generate new invoice

export type Generate_New_Invoice_Api_Payload = {
  dueDate: string;
  user_id: null;
  startDate: string;
  endDate: string;
  total: null;
  enrollment: [
    {
      enrollmentName: string;
      numberOfClasses: number;
      hourlyRate: number;
      total: number;
    }
  ];
};

type InvoiceStatus = {
  PENDING: "PENDING";
  PAID: "PAID";
  CANCELLED: "CANCELLED";
};

export type Generate_New_Invoice_Api_Response = {
  id: number;
  user_id: number;
  amount: number;
  due_date: string;
  status: InvoiceStatus;
  pdf_content: string;
};

export type Generate_Invoice_For_Parent_Api_Payload_Type = {
  dueDate: string;
  parent_id: string;
  total: number;
  users: [
    {
      user_id: number;
      enrollments: [
        {
          enrollmentName: string;
          numberOfClasses: number;
          hourlyRate: number;
          total: number;
        }
      ];
    }
  ];
};

export type Generate_Invoice_For_Parent_Api_Response_Type = {
  message: "Invoice generated successfully";
  invoice: {
    id: "inv_12345";
    user_id: "12345";
    amount: 500.75;
    due_date: "2025-04-15";
    status: "PENDING";
  };
  pdf_url: "https://dev.tuitionaledu.com/public/uploads/JohnDoe_Apr_25.pdf";
};
