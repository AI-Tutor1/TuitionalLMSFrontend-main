export type Generate_Update_Payouts_Api_Response_Type = {
  message: string;
  payouts: {
    tutorId: number;
    action: string;
    payout: {
      id: number;
      tutor_id: number;
      start_date: string;
      end_date: string;
      total_sessions: number;
      balance: number;
      status: string;
      updatedAt: number;
      createdAt: number;
    }[];
  };
};
