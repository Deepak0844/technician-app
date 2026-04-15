import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SecureStorageAdapter from "../utils/secureStorageAdapter";
import api from "../services/api";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import draftReducer from "./slices/draftSlice";

/**
 * Draft data contains PII (customer names, phones, GPS coordinates, internal
 * notes) — persist it in hardware-backed encrypted storage.
 */
const draftPersistConfig = {
  key: "draft",
  storage: SecureStorageAdapter,
};

/**
 * Theme preference is not sensitive — plain AsyncStorage keeps SecureStore
 * capacity free for actual credentials.
 */
const themePersistConfig = {
  key: "theme",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer, // NOT persisted — token lives in SecureStore via StorageUtils
  theme: persistReducer(themePersistConfig, themeReducer),
  draft: persistReducer(draftPersistConfig, draftReducer),
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);
export default store;
