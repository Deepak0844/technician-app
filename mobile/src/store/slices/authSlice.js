import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config/apiConfig";
import StorageUtils from "../../utils/storageUtils";
import { ApiUrls } from "../../constants/appConstants";

export const initializeAuth = createAsyncThunk("auth/initialize", async (_, { rejectWithValue }) => {
  const token = await StorageUtils.getToken();
  if (!token) return rejectWithValue("no_token");
  try {
    const response = await axios.get(`${API_BASE_URL}${ApiUrls.AUTH_ME}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { token, user: response.data?.data };
  } catch {
    await StorageUtils.clearToken();
    return rejectWithValue("invalid_token");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    isAuthenticated: false,
    tokenLoaded: false,
    isFirstLogin: false,
  },
  reducers: {
    /**
     * Called after OTP verification.
     * - If first login: isAuthenticated stays false so the AuthStack remains visible
     *   and we can navigate to SetupProfileScreen within it.
     * - If returning user: isAuthenticated = true → AppNavigator switches to MainTabs.
     */
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isFirstLogin = action.payload.isFirstLogin ?? false;
      state.isAuthenticated = !action.payload.isFirstLogin;
      state.tokenLoaded = true;
    },
    /**
     * Called when the user finishes (or skips) the SetupProfile screen.
     * Marks auth as complete so AppNavigator transitions to MainTabs.
     */
    completeFirstLoginSetup(state) {
      state.isFirstLogin = false;
      state.isAuthenticated = true;
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.tokenLoaded = true;
      state.isFirstLogin = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        const isFirst = !action.payload.user?.name;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isFirstLogin = isFirst;
        state.isAuthenticated = !isFirst;
        state.tokenLoaded = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.tokenLoaded = true;
      });
  },
});

export const { setCredentials, clearCredentials, completeFirstLoginSetup } = authSlice.actions;
export default authSlice.reducer;
