import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  createTicketApi,
  getAllTicketsApi,
  deleteTicketApi,
} from "@/api/ticket.api";
import {
  CreateTicket_Payload_Type,
  GetAllTickets_Response_Type,
} from "@/types/ticket/ticket.types";

export const createTicket = (
  payload: CreateTicket_Payload_Type,
  config: configDataType
) => AxiosPost<any>(createTicketApi(), config, payload);

export const getAllTickets = (params: any, config: configDataType) =>
  AxiosGet<GetAllTickets_Response_Type>(getAllTicketsApi(params), config);

export const deleteTicket = (id: number | null, config: configDataType) =>
  AxiosDelete<any>(deleteTicketApi(id), config);
