// get all onboarding request

export type Subject = {
  name: string;
  currency: string;
  rate: string;
  level: string;
  curriculum: string;
};

export type ScheduleSlot = {
  start: string;
  end: string;
  selected: boolean;
};

export type Schedule = {
  [day: string]: {
    selected: boolean;
    slots: ScheduleSlot[];
  };
};

export type JsonData = {
  subjects: Subject[];
  schedule: Schedule;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
  country: string;
  currency: string;
  profileDescription: string;
  profileImage: string;
  university: string;
  degree: string;
  degreeType: string;
  startOfStudy: number;
  endOfStudy: number;
  document: string;
  video: string;
  hoursPerWeek: string;
  status?: string;
};

export type Onboarding_Requests = {
  id: number;
  jsonData: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Onboarding_Requests_Parsed = {
  id: number;
  parsed_jsonData: JsonData;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};

export type TutorOnboarding_Response = Onboarding_Requests[];
export type TutorOnboarding_Parsed_Response = Onboarding_Requests_Parsed[];
