import axios from "axios";
import { BASE_URL } from "@/services/config";

const API_URL = BASE_URL;

// Get all rooms for a user
export const getRoomsForUser = async (userId: number) => {
  try {
    const response = await axios.get(`${API_URL}/api/rooms/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

// Create a new room
export const createRoom = async (data: { name: string; users: number[] }) => {
  try {
    const response = await axios.post(`${API_URL}/api/rooms`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

// Get all messages for a room
export const getMessagesForRoom = async (roomId: number, threadId?: number) => {
  try {
    const url = threadId
      ? `${API_URL}/api/messages/${roomId}?thread_id=${threadId}`
      : `${API_URL}/api/messages/${roomId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (data: {
  room_id: number;
  sender_id: number;
  message_content: string;
  message_type?: string;
  parent_id?: number;
  replied_to_id?: number;
  media_url?: string;
  thumbnail_url?: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/api/messages`, data);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Update a message
export const updateMessage = async (
  messageId: number,
  data: {
    message_content?: string;
    message_type?: string;
    media_url?: string;
    thumbnail_url?: string;
    parent_id?: number;
    replied_to_id?: number;
  }
) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/messages/${messageId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/api/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// Add a reaction to a message
export const addReaction = async (data: {
  message_id: number;
  user_id: number;
  reaction_type: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/messages/reactions`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
};

// Remove a reaction from a message
export const removeReaction = async (messageId: number, userId: number) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/messages/${messageId}/reactions/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing reaction:", error);
    throw error;
  }
};

// Get all reactions for a message
export const getReactionsForMessage = async (messageId: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/messages/${messageId}/reactions`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reactions:", error);
    throw error;
  }
};

// Mark a message as viewed
export const markMessageAsViewed = async (data: {
  message_id: number;
  user_id: number;
}) => {
  try {
    const response = await axios.post(`${API_URL}/api/messages/views`, data);
    return response.data;
  } catch (error) {
    console.error("Error marking message as viewed:", error);
    throw error;
  }
};

// Get all viewers for a message
export const getViewersForMessage = async (messageId: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/messages/${messageId}/views`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching viewers:", error);
    throw error;
  }
};

// Upload a file for a message
export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_URL}/api/messages/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Upload a voice note for a message
export const uploadVoiceNote = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_URL}/api/messages/upload/voice`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading voice note:", error);
    throw error;
  }
};
