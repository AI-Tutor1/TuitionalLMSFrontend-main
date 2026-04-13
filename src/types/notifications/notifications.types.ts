export type Notification_Types = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
};

export type getNotificationsForUser_Response_Types = {
  success: boolean;
  message: string;
  hasUnread: number;
  totalPages: number;
  currentPage: number;
  totalCount: number;
  data: Notification_Types[];
};

export type markNotificationAsRead_Response_Types = {
  success: boolean;
  message: string;
  data: [
    {
      id: number;
      user_id: number;
      title: string;
      message: string;
      link: string;
      is_read: boolean;
      created_at: string;
      updated_at: string;
    },
  ];
};
