export type UpdatePayoutStatusType_Api_Params_Type = string;

export type Payout = {
  id: number;
  tutor_id: number;
  start_date: string; // ISO 8601 date format (e.g., "2025-03-01T00:00:00.000Z")
  end_date: string; // ISO 8601 date format
  total_sessions: number;
  balance: number;
  status: string; // e.g., "Paid"
};

export type UpdatePayoutStatusType_Api_Response_Type = {
  message: string;
  payout: Payout;
};
