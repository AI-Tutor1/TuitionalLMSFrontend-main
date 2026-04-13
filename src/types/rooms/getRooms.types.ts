export type User = {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
  country_code: string;
};

export type RoomUser = {
  id: number;
  room_id: number;
  user_id: number;
  status: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  user: User;
};

export type Room = {
  id: number;
  room_name: string;
  last_message_id: number | null;
  enrollment_id: number;
  status: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  roomUsers: RoomUser[];
  lastMessage: {
    id: number;
    message_content: string;
    message_type: string;
    createdAt: string;
  } | null; // You may want to define a specific Message type here
};

// If you want to type the entire response array:
export type Rooms_Api_Response_Type = Room[];

export type GetRoomsOptions_Type = {
  userId?: number;
  limit?: number;
  offset?: number;
  search?: string;
};
