import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "@services/api/authApi";

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
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
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
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
        const user = action.payload.data;
        state.user = user; // keep user in sync on every getMe success
        if (!state.tokenLoaded) {
          // Bootstrap phase: also set auth + first-login flags
          const isFirst = !user?.name;
          state.isFirstLogin = isFirst;
          state.isAuthenticated = !isFirst;
          state.tokenLoaded = true;
        }
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
        // Only react during bootstrap (tokenLoaded still false).
        // Post-bootstrap 401s are already handled by customBaseQuery.
        if (!state.tokenLoaded) {
          state.isAuthenticated = false;
          state.tokenLoaded = true;
        }
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  completeFirstLoginSetup,
  updateUser,
} = authSlice.actions;
export default authSlice.reducer;
