import { BASE_URL } from "@/services/config";
import { GetRoomsOptions_Type } from "@/types/rooms/getRooms.types";

export const getRoomsApi = (options: GetRoomsOptions_Type) => {
  const params = [];
  if (options?.userId) params.push(`userId=${options.userId}`);
  if (options?.limit) params.push(`limit=${options.limit}`);
  if (options?.offset) params.push(`offset=${options.offset}`);
  if (options?.search) params.push(`search=${options.search}`);

  const queryString = params.join("&");
  return `${BASE_URL}/api/rooms${queryString ? `?${queryString}` : ""}`;
};

export const deleteRoomApi = (roomId: number) =>
  `${BASE_URL}/api/rooms/${roomId}`;
