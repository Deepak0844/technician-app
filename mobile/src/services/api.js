import { createApi } from "@reduxjs/toolkit/query/react";
import customBaseQuery from "@services/customBaseQuery";
import { TagTypes } from "@constants/apiTags";

const api = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery(),
  tagTypes: Object.values(TagTypes),
  endpoints: () => ({}),
});

export default api;
