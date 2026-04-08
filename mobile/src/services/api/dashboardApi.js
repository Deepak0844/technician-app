import api from "../api";
import { ApiUrls } from "../../constants/appConstants";
import { TagTypes } from "../../constants/apiTags";
import ApiUtils from "./apiUtils";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => ({ url: ApiUrls.DASHBOARD_SUMMARY }),
      providesTags: (result, error, arg) => ApiUtils.listTags(TagTypes.DASHBOARD),
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
