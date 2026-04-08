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
  initialState: { token: null, user: null, isAuthenticated: false, tokenLoaded: false },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.tokenLoaded = true;
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.tokenLoaded = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.tokenLoaded = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.tokenLoaded = true;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
