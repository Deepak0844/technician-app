import { configureStore, combineReducers } from "@reduxjs/toolkit";
import api from "@services/api";
import authReducer from "@store/slices/authSlice";
import themeReducer from "@store/slices/themeSlice";
import syncReducer from "@store/slices/syncSlice";

/**
 * Theme is restored by the initializeTheme thunk (reads AsyncStorage).
 * Auth token lives in expo-secure-store (via StorageUtils).
 * Offline jobs are persisted in SQLite via SyncManager — no redux-persist needed.
 */
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  theme: themeReducer,
  sync: syncReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export default store;
