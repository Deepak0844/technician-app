import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  drafts: [], // Array of { id, data, customerName, applianceType, lastSaved }
};

const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    addDraft: (state, action) => {
      const { data, customerName, applianceType } = action.payload;
      state.drafts.push({
        id: uuidv4(),
        data,
        customerName,
        applianceType,
        lastSaved: new Date().toISOString(),
      });
    },
    updateDraft: (state, action) => {
      const { id, data, customerName, applianceType } = action.payload;
      const index = state.drafts.findIndex((d) => d.id === id);
      if (index !== -1) {
        state.drafts[index] = {
          ...state.drafts[index],
          data,
          customerName: customerName || state.drafts[index].customerName,
          applianceType: applianceType || state.drafts[index].applianceType,
          lastSaved: new Date().toISOString(),
        };
      }
    },
    removeDraft: (state, action) => {
      state.drafts = state.drafts.filter((d) => d.id !== action.payload);
    },
    clearAllDrafts: (state) => {
      state.drafts = [];
    },
  },
});

export const { addDraft, updateDraft, removeDraft, clearAllDrafts } = draftSlice.actions;
export default draftSlice.reducer;
