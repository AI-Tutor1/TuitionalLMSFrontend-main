export type ModalState = {
  add: boolean;
  edit: boolean;
  delete: boolean;
  pause: {
    open: boolean;
    id: number | null;
    name: string;
    on_break: boolean | null;
    is_permanent: null | false | true;
  };
  manualClass: {
    open: boolean;
    enrollment_id: number | null;
    duration: number | null;
    startTime?: string | null;
    endTime?: string | null;
    name?: string | null;
  };
  instantClass: {
    open: boolean;
    enrollment_id: number | null;
  };
  extraClass: {
    open: boolean;
    enrollment_id: number | null;
  };
};

export type FilterState = {
  currentPage: number;
  rowsPerPage: number;
  dateFilter: string | [string, string] | null;
  selectedTeacher: string;
  selectedStudent: string;
  enrollmentSearch: string;
  on_break: string;
};

export type EnrollmentItem = {
  id: number | string;
  [key: string]: any;
};
