export type GetAllDemos_Api_Params_Type = {
  date?: string;
  status?: string;
  conversion?: string;
  limit?: number;
  page?: number;
  tutorId?: string;
};

export type GetAllDemos_Api_Response_Type = {
  success: boolean;
  data: {
    id: number;
    tutorId: number;
    subjectId: number;
    curriculumId: number;
    gradeId: number;
    studentName: string;
    parentName: string;
    date: string;
    time: string;
    duration: number;
    meetLink: string;
    status: "pending";
    conversion: false;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
    boardId: null;
    demoTutor: {
      id: number;
      name: string;
      email: string;
      profileImageUrl: string;
    };
    demoSubject: {
      id: number;
      name: string;
    };
    demoGrade: {
      id: number;
      name: string;
    };
    demoBoard: null;
    demoCurriculum: {
      id: number;
      name: string;
    };
    tutorFeedback: null;
    adminFeedback: null;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
