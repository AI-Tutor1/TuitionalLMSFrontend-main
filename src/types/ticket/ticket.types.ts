export type CreateTicket_Payload_Type = {
  subject: string;
  // message: string;
  sendToIds: string[];
  priority: string;
  created_by_user_id: number | null;
  enrollment_id: number | null;
  status: string;
};

export type GetAllTickets_Response_Type = {
  data: [
    {
      id: number;
      subject: string;
      message: string;
      status: string;
      priority: string;
      enrollment_id: number;
      created_by_user_id: number;
      createdAt: string | null;
      updatedAt: string | null;
      deletedAt: string | null;
      recipients: [
        {
          id: number;
          name: string;
          email: string;
        }
      ];
      createdBy: {
        id: number;
        name: string;
        email: string;
      };
      ticketRecipients: [
        {
          id: number;
          ticket_id: number;
          user_id: number;
          createdAt: string | null;
          updatedAt: string | null;
          deletedAt: string | null;
        }
      ];
      enrollment: {
        id: number;
        tutor_id: number;
        status: number;
        on_break: boolean;
        subject_id: number;
        board_id: number;
        curriculum_id: number;
        grade_id: number;
        hourly_rate: number;
        request_rate: number;
        group_id: string;
        tutor_hourly_rate: number;
        name: string;
        google_chat_space_id: string;
        google_chat_space_name: string;
        is_permanent: boolean | null;
        pause_ends_at: string | null;
        pause_starts_at: string | null;
        lead_generator: string;
        priority: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        enrollment_id: number | null;
      };
    }
  ];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
