import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import createNoopStorage from "./noopStorage/noopStorage";

// Reducers
import userReducer from "./slices/user-slice";
import resourceReducer from "./slices/resources-slice";
import getUsersByGroupReducer from "./slices/usersByGroup-slice";
import rolesReducer from "./slices/role-slice";
import assignedPagesSlice from "./slices/assignedPages-slice";

// Configuration for redux-persist for noop-state
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

// User reducer persist config
const userPersistConfig = {
  key: "user",
  storage,
};

// Resources reducer persist config
const resourcesPersistConfig = {
  key: "resources",
  storage,
};

// Roles reducer persist config
const rolesPersistConfig = {
  key: "roles",
  storage,
};

// User reducer persist config
const userByGroupPersistConfig = {
  key: "userByGroup",
  storage,
};

// Assigned pages slice persist config
const assignedPagesPersistConfig = {
  key: "assignedPages",
  storage,
};

// Combine reducers and only persist the userReducer
const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  resources: persistReducer(resourcesPersistConfig, resourceReducer),
  assignedPages: persistReducer(assignedPagesPersistConfig, assignedPagesSlice),
  usersByGroup: persistReducer(
    userByGroupPersistConfig,
    getUsersByGroupReducer
  ),
  roles: persistReducer(rolesPersistConfig, rolesReducer),
});

// Configure the store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

// Create a persistor
const persistor = persistStore(store);

export { store, persistor };

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
