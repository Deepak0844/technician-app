import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import StorageUtils from "../../utils/storageUtils";
import { Appearance } from "react-native";

export const initializeTheme = createAsyncThunk(
  "theme/initialize",
  async () => {
    const savedTheme = await StorageUtils.getTheme();
    if (savedTheme) return savedTheme;
    return Appearance.getColorScheme() || "dark";
  }
);

export const updateThemeSelection = createAsyncThunk(
  "theme/update",
  async (mode, { dispatch }) => {
    await StorageUtils.saveTheme(mode);
    dispatch(setTheme(mode));
    return mode;
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: Appearance.getColorScheme() || "dark",
    isInitialized: false
  },
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeTheme.fulfilled, (state, action) => {
      state.mode = action.payload;
      state.isInitialized = true;
    });
  }
});

export const { setTheme } = themeSlice.actions;
export const toggleTheme = () => (dispatch, getState) => {
  const currentMode = getState().theme.mode;
  const newMode = currentMode === "dark" ? "light" : "dark";
  dispatch(updateThemeSelection(newMode));
};

export default themeSlice.reducer;
