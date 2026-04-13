export type MonthlySessionDataForTutor_Api_Params_Type = {
  tutor_id?: string;
};

export type MonthlySessionDataForStudent_Api_Params_Type = {
  student_id?: string;
};
export type MonthlySessionDataForParent_Api_Params_Type = {
  student_id?: string;
  childrens?: string;
};

export type MonthlySessionDataForTutorStudent_Api_Response = {
  success: boolean;
  data: [
    {
      month: string;
      value: number;
    }
  ];
};
