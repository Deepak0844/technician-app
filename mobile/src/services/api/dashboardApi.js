import api from "../api";
import { ApiUrls } from "@constants/appConstants";
import { TagTypes } from "@constants/apiTags";
import ApiUtils from "@services/api/apiUtils";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => ({ url: ApiUrls.DASHBOARD_SUMMARY }),
      providesTags: (result, error, arg) =>
        ApiUtils.listTags(TagTypes.DASHBOARD),
    }),
  }),
  // Fast Refresh re-runs this module in dev; let it re-register the endpoints
  overrideExisting: __DEV__,
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
