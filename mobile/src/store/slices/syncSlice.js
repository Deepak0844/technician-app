import { createSlice } from "@reduxjs/toolkit";

/**
 * Tracks the offline sync queue state so UI components (OfflineBanner,
 * DashboardScreen) can react to pending / in-flight offline jobs.
 */
const syncSlice = createSlice({
  name: "sync",
  initialState: {
    queueCount: 0,  // number of operations waiting to be sent to server
    isSyncing: false,
  },
  reducers: {
    setSyncQueueCount(state, action) {
      state.queueCount = action.payload;
    },
    setSyncing(state, action) {
      state.isSyncing = action.payload;
    },
  },
});

export const { setSyncQueueCount, setSyncing } = syncSlice.actions;
export default syncSlice.reducer;
