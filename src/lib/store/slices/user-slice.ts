import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User_Type, SignIn_Response_Type } from "@/services/auth/auth.types";

export interface UserState {
  token: string;
  user: User_Type | null;
  enrollementIds?: number[];
  childrens?: number[];
  hasInitialized: boolean;
}

const initialState: UserState = {
  token: "",
  user: null,
  hasInitialized: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<SignIn_Response_Type>) => {
      state.token = action.payload.token;
      state.user = { ...action.payload.user };
      state.hasInitialized = false;
      if (action.payload.enrollementIds) {
        state.enrollementIds = [...action.payload.enrollementIds];
      }
      if (action.payload.childrens) {
        state.childrens = [...action.payload.childrens];
      }
    },
    setInitialized: (state) => {
      state.hasInitialized = true;
    },
    setUserSyncing: (state, action: PayloadAction<{ isSync: boolean }>) => {
      if (state.user) {
        state.user.isSync = action.payload.isSync;
      }
    },
    emptyUserData: (state) => {
      state.token = "";
      state.user = null;
      state.hasInitialized = false;
      delete state.enrollementIds;
      delete state.childrens;
    },
  },
});

export const { setUserData, emptyUserData, setUserSyncing, setInitialized } =
  userSlice.actions;

export default userSlice.reducer;
