export interface User {
  id: number;
  name: string;
  profileImageUrl?: string;
}

export interface Reaction {
  id: number;
  reaction_type: string;
  user: User;
}

export interface MessageView {
  id: number;
  user: User;
}

export interface MessageData {
  id: number;
  sender_id: number;
  room_id: number | null;
  message_content: string;
  message_type: string;
  createdAt: string;
  sender: User;
  reactions: Reaction[];
  views: MessageView[];
  media_url?: string;
  thumbnail_url?: string;
  audio_url?: string;
  duration_seconds?: number;
  transcript?: string;
  waveform_data?: string;
  replied_to_id?: number;
  repliedToMessage?: Partial<MessageData>;
  parent_id?: number;
}

export interface ChatState {
  messages: MessageData[];
  replyingTo: MessageData | null;
  viewingThread: MessageData | null;
}
