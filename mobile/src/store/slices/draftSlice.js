import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { drafts as draftsTable } from "@db/schema";

/**
 * Load all persisted drafts from SQLite on app boot.
 * Called once inside AppBootstrap — replaces redux-persist rehydration.
 */
export const loadDrafts = createAsyncThunk("draft/loadAll", async () => {
  const rows = await db.select().from(draftsTable);
  return rows.map((row) => ({
    id: row.id,
    customerName: row.customerName,
    applianceType: row.applianceType,
    data: JSON.parse(row.data),
    lastSaved: row.lastSaved,
  }));
});

/** Persist a new draft to SQLite and add it to Redux state. */
export const addDraft = createAsyncThunk(
  "draft/add",
  async ({ data, customerName, applianceType }) => {
    const id = uuidv4();
    const lastSaved = new Date().toISOString();
    await db.insert(draftsTable).values({
      id,
      customerName: customerName ?? "",
      applianceType: applianceType ?? "",
      data: JSON.stringify(data),
      lastSaved,
    });
    return { id, data, customerName, applianceType, lastSaved };
  },
);

/** Update an existing draft in SQLite and refresh Redux state. */
export const updateDraft = createAsyncThunk(
  "draft/update",
  async ({ id, data, customerName, applianceType }) => {
    const lastSaved = new Date().toISOString();
    await db
      .update(draftsTable)
      .set({
        data: JSON.stringify(data),
        customerName: customerName ?? "",
        applianceType: applianceType ?? "",
        lastSaved,
      })
      .where(eq(draftsTable.id, id));
    return { id, data, customerName, applianceType, lastSaved };
  },
);

/** Delete a single draft from SQLite and remove it from Redux state. */
export const removeDraft = createAsyncThunk("draft/remove", async (id) => {
  await db.delete(draftsTable).where(eq(draftsTable.id, id));
  return id;
});

/** Delete all drafts from SQLite and clear Redux state. */
export const clearAllDrafts = createAsyncThunk("draft/clearAll", async () => {
  await db.delete(draftsTable);
});

const draftSlice = createSlice({
  name: "draft",
  initialState: {
    drafts: [],
    isLoaded: false, // true once loadDrafts has resolved
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDrafts.fulfilled, (state, action) => {
        state.drafts = action.payload;
        state.isLoaded = true;
      })
      .addCase(addDraft.fulfilled, (state, action) => {
        state.drafts.push(action.payload);
      })
      .addCase(updateDraft.fulfilled, (state, action) => {
        const index = state.drafts.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state.drafts[index] = action.payload;
      })
      .addCase(removeDraft.fulfilled, (state, action) => {
        state.drafts = state.drafts.filter((d) => d.id !== action.payload);
      })
      .addCase(clearAllDrafts.fulfilled, (state) => {
        state.drafts = [];
      });
  },
});

export default draftSlice.reducer;
