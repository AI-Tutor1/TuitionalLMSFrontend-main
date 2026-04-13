import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import {
  Rooms_Api_Response_Type,
  GetRoomsOptions_Type,
} from "@/types/rooms/getRooms.types";
import { getRoomsApi, deleteRoomApi } from "@/api/rooms";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const getRooms = (
  options: GetRoomsOptions_Type,
  config: configDataType,
) => AxiosGet<Rooms_Api_Response_Type>(getRoomsApi(options), config);

export const deleteRoom = (config: configDataType, roomId: number) =>
  AxiosDelete<any>(deleteRoomApi(roomId), config);

export const useDeleteRoom = (config: configDataType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => deleteRoom(config, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getRooms"] });
    },
  });
};
