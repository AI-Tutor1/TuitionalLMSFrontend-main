export type Create_Demo_Payload_Type = {
  tutorId: number;
  subjectId: number;
  gradeId: number;
  curriculumId: number;
  studentName: string;
  parentName: string;
  date: string;
  time: string;
  duration: string;
};

export type Create_Demo_Api_Response_Type = {
  success: boolean;
  message: string;
  data: {
    id: number;
    tutorId: number;
    subjectId: number;
    gradeId: number;
    curriculumId: number;
    studentName: string;
    parentName: string;
    date: string;
    time: string;
    duration: string;
    meetLink: string;
  };
};
