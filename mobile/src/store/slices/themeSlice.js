import { createSlice } from "@reduxjs/toolkit";
import { Appearance } from "react-native";

/**
 * Theme slice — no async thunks.
 * Storage reads happen before the store is created (see store/index.js).
 * Storage writes happen in components via StorageUtils directly.
 */
const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: Appearance.getColorScheme() || "dark",
    palette: "purple",
  },
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload;
    },
    setPalette(state, action) {
      state.palette = action.payload;
    },
  },
});

export const { setTheme, setPalette } = themeSlice.actions;
export default themeSlice.reducer;
