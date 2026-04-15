import { configureStore, combineReducers } from "@reduxjs/toolkit";
import api from "../services/api";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import draftReducer from "./slices/draftSlice";

/**
 * Persistence strategy — no redux-persist needed:
 *
 *  auth  — NOT persisted in Redux. JWT lives in expo-secure-store (hardware-backed
 *           Keychain/Keystore). Session is restored on boot via initializeAuth.
 *
 *  theme — Persisted in SQLite `settings` table via StorageUtils.saveTheme/getTheme.
 *           Restored on boot via the initializeTheme thunk.
 *
 *  draft — Persisted in SQLite `drafts` table via Drizzle ORM async thunks.
 *           Restored on boot via the loadDrafts thunk.
 */
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  theme: themeReducer,
  draft: draftReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export default store;
