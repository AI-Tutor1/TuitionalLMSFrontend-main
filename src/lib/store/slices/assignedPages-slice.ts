import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import {} from "@reduxjs/toolkit";
import {
  GetAllPages_Api_Response_Type,
  GetAllPages_Api_Request_Type_Data,
} from "@/types/pages/getAllPages.types";
import { getAllPagesAssignedToRole } from "@/services/dashboard/roles/roles";
import { configDataType } from "@/services/config";

interface AssignedPagesType {
  assignedPages: null | GetAllPages_Api_Request_Type_Data;
}

const initialState: AssignedPagesType = {
  assignedPages: null,
};

export const assignedPagesSlice = createSlice({
  name: "assignedPages",
  initialState,
  reducers: {
    setAssignedPages: (state, action: PayloadAction<AssignedPagesType>) => {
      state.assignedPages =
        action.payload.assignedPages && action.payload.assignedPages.length > 0
          ? [...action.payload.assignedPages]
          : null;
    },
    emptyAssignedPages: (state) => {
      state.assignedPages = null;
    },
  },
});

export const { setAssignedPages, emptyAssignedPages } =
  assignedPagesSlice.actions;

export default assignedPagesSlice.reducer;

// Asynchronous thunk for fetching resources
export const fetchAllPagesAssignToUser =
  (roleId: number | null, config: configDataType) =>
  async (dispatch: Dispatch): Promise<GetAllPages_Api_Response_Type | null> => {
    try {
      if (roleId === null) {
        dispatch(emptyAssignedPages());
        return null;
      }
      const response = await getAllPagesAssignedToRole(roleId, config);
      if (response && response.pages) {
        dispatch(
          setAssignedPages({
            assignedPages: response.pages,
          })
        );
      }
      return response ?? null;
    } catch (error) {
      // console.error("Failed to fetch assigned pages:", error);
      throw error;
    }
  };
