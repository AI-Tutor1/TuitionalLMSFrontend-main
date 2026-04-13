export type SessionHourlyCount_Api_Params_Type = {
  date?: string;
  startDate?: string;
  endDate?: string;
};

export type SessionHourlyCount_ApiResponse_Type = {
  range: {
    start: string;
    end: string;
  };
  hourlyCounts: {
    hour: number;
    count: number;
  }[];
};
