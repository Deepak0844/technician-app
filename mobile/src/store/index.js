import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { Appearance } from "react-native";
import api from "@services/api";
import authReducer from "@store/slices/authSlice";
import themeReducer from "@store/slices/themeSlice";
import StorageUtils from "@utils/storageUtils";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  theme: themeReducer,
});

/**
 * Async store factory — reads saved theme + palette from SecureStore
 * BEFORE the store is created so the initial state is always correct.
 * No thunks or isInitialized flags needed.
 */
export async function createAppStore() {
  const [savedMode, savedPalette] = await Promise.all([
    StorageUtils.getTheme(),
    StorageUtils.getPalette(),
  ]);

  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: {
      theme: {
        mode: savedMode || Appearance.getColorScheme() || "dark",
        palette: savedPalette || "purple",
      },
    },
  });
}
