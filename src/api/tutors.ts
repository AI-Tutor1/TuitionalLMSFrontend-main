import { BASE_URL } from "@/services/config";

export const generateInterviewLinkApi = (id: number) =>
  `${BASE_URL}/api/generate-interview/${id}`;

export const approvedRequestApi = () => `${BASE_URL}/api/approveRequest`;

export const interviewsAlignedApi = (params: {
  limit: number | null;
  offset: number | null;
  startDate?: string;
  endDate?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.offset) searchParams.append("offset", params.offset.toString());
  if (params.startDate) searchParams.append("startDate", params.startDate);
  if (params.endDate) searchParams.append("endDate", params.endDate);
  return `${BASE_URL}/api/interviews/aligned?${searchParams.toString()}`;
};
