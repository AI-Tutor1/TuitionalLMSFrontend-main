import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import {
  Curriculum_Type,
  Board_Type,
  Subject_Type,
  Grade_Type,
  ResourceGetAll_ApiResponse_Type,
} from "@/services/dashboard/superAdmin/curriulums/curriulums.type";
import { AxiosGet } from "@/utils/helpers/api-methods";
import { curriculumApi } from "@/api/curriculum";
import { configDataType } from "@/services/config";

interface ResourcesState {
  board: Board_Type[] | null;
  grades: Grade_Type[] | null;
  subject: Subject_Type[] | null;
  curriculum: Curriculum_Type[] | null;
}

const initialState: ResourcesState = {
  board: null,
  grades: null,
  subject: null,
  curriculum: null,
};

export const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    setResourcesData: (state, action: PayloadAction<ResourcesState>) => {
      state.board = action.payload.board;
      state.grades = action.payload.grades;
      state.subject = action.payload.subject;
      state.curriculum = action.payload.curriculum;
    },
    emptyResources: (state) => {
      state.board = null;
      state.grades = null;
      state.subject = null;
      state.curriculum = null;
    },
  },
});

export const { setResourcesData, emptyResources } = resourcesSlice.actions;

export default resourcesSlice.reducer;

// Asynchronous thunk for fetching resources
export const fetchResources =
  (config: configDataType) =>
  async (
    dispatch: Dispatch,
  ): Promise<ResourceGetAll_ApiResponse_Type | null> => {
    try {
      const response = await AxiosGet<ResourceGetAll_ApiResponse_Type>(
        curriculumApi(),
        config,
      );

      // Only update state if response is successful and has data
      if (
        response?.board ||
        response?.grades ||
        response?.subject ||
        response?.curriculum
      ) {
        dispatch(
          resourcesSlice.actions.setResourcesData({
            board: response.board,
            grades: response.grades,
            subject: response.subject,
            curriculum: response.curriculum,
          }),
        );
        return response;
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      // Don't clear state on error - keep existing data
      throw error;
    }
  };
