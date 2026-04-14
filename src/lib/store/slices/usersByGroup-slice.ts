import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";

import {
  GetAllUsersByGroup_ApiResponse_Type,
  UserByGroup_Object,
} from "@/services/dashboard/superAdmin/users/users.type";
import { getAllUsersByGroup } from "@/services/dashboard/superAdmin/users/users";
import { configDataType } from "@/services/config";

const initialState: {
  students: UserByGroup_Object | null;
  teachers: UserByGroup_Object | null;
  parents: UserByGroup_Object | null;
} = {
  students: null,
  teachers: null,
  parents: null,
};

export const getAllUserByGroupSlices = createSlice({
  name: "usersByGroup",
  initialState,
  reducers: {
    setUserByGroup: (
      state,
      action: PayloadAction<GetAllUsersByGroup_ApiResponse_Type>
    ) => {
      state.students = action.payload.students;
      state.teachers = action.payload.teachers;
      state.parents = action.payload.parents;
    },
    emptyUserByGroup: (state) => {
      state.students = null;
      state.teachers = null;
      state.parents = null;
    },
  },
});

export const { setUserByGroup, emptyUserByGroup } =
  getAllUserByGroupSlices.actions;

export default getAllUserByGroupSlices.reducer;

// Asynchronous thunk for fetching resources
export const fetchUsersByGroup =
  (config: configDataType) =>
  async (dispatch: Dispatch): Promise<any> => {
    try {
      const response = await getAllUsersByGroup(config);
      if (response) {
        const { students, teachers, parents } = response;
        dispatch(
          getAllUserByGroupSlices.actions.setUserByGroup({
            students,
            teachers,
            parents,
          })
        );
        return response;
      }
      return null;
    } catch (error) {
      console.error("Error fetching users by group:", error);
      throw error;
    }
  };
