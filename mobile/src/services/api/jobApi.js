import api from "../api";
import { ApiUrls } from "@constants/appConstants";
import { TagTypes } from "@constants/apiTags";
import ApiUtils from "@services/api/apiUtils";
import NotificationUtils from "@utils/notificationUtils";

export const jobApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query({
      query: (params) => ({ url: ApiUrls.JOBS, params }),
      providesTags: ApiUtils.paginatedTags(TagTypes.JOBS),
    }),
    // Infinite-scroll variant used by JobHistoryScreen
    getJobsPaged: builder.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: 1,
        refetchCachedPages: false, // on any refetch (pull-to-refresh, tag invalidation) restart from page 1
        getNextPageParam: (lastPage) =>
          lastPage.pagination?.hasNext
            ? lastPage.pagination.page + 1
            : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: ApiUrls.JOBS,
        params: { ...queryArg, page: pageParam, pageSize: 10 },
      }),
      providesTags: () => ApiUtils.listTags(TagTypes.JOBS),
    }),
    createJob: builder.mutation({
      query: (body) => ({ url: ApiUrls.JOBS, method: "post", data: body }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const createdJob = data?.data;
          if (
            createdJob?._id &&
            createdJob.status !== "completed" &&
            createdJob.status !== "cancelled" &&
            new Date(createdJob.serviceDate) > new Date()
          ) {
            await NotificationUtils.scheduleJobReminders(createdJob);
          }
        } catch {
          // Notification errors must not break the create flow
        }
      },
      invalidatesTags: (result, error, arg) => [
        ...ApiUtils.listTags(TagTypes.JOBS),
        ...ApiUtils.listTags(TagTypes.DASHBOARD),
      ],
    }),
    updateJob: builder.mutation({
      query: ({ id, ...body }) => ({
        url: ApiUrls.JOB_BY_ID(id),
        method: "put",
        data: body,
      }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const updatedJob = data?.data;
          if (updatedJob?._id) {
            // Always cancel stale reminders first
            await NotificationUtils.cancelJobReminders(updatedJob._id);
            // Only reschedule for active (non-terminal) future jobs
            if (
              updatedJob.status !== "completed" &&
              updatedJob.status !== "cancelled" &&
              new Date(updatedJob.serviceDate) > new Date()
            ) {
              await NotificationUtils.scheduleJobReminders(updatedJob);
            }
          }
        } catch {
          // Notification errors must not bubble up and break the update flow
        }
      },
      invalidatesTags: (result, error, arg) => [
        ...ApiUtils.entityTags(TagTypes.JOBS)(result, error, arg),
        ...ApiUtils.listTags(TagTypes.JOBS),
        ...ApiUtils.listTags(TagTypes.DASHBOARD),
      ],
    }),
    getJobById: builder.query({
      query: (id) => ({ url: ApiUrls.JOB_BY_ID(id) }),
      providesTags: ApiUtils.entityTags(TagTypes.JOBS),
    }),
    getRecentOrganizations: builder.query({
      query: (q) => ({
        url: ApiUrls.JOBS_RECENT_ORGANIZATIONS,
        params: q ? { q } : undefined,
      }),
      // Refetch whenever jobs change (a new job may add an organization)
      providesTags: ApiUtils.listTags(TagTypes.JOBS),
    }),
    getRecentAppliances: builder.query({
      query: (q) => ({
        url: ApiUrls.JOBS_RECENT_APPLIANCES,
        params: q ? { q } : undefined,
      }),
      // Refetch whenever jobs change (a new job may add an appliance name)
      providesTags: ApiUtils.listTags(TagTypes.JOBS),
    }),
    getJobsByCustomer: builder.query({
      query: (customerId) => ({ url: ApiUrls.JOBS_BY_CUSTOMER(customerId) }),
      providesTags: ApiUtils.paginatedTags(TagTypes.JOBS),
    }),
    // Infinite-scroll variant used by CustomerDetailsScreen
    getJobsByCustomerPaged: builder.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: 1,
        refetchCachedPages: false,
        getNextPageParam: (lastPage) =>
          lastPage.pagination?.hasNext
            ? lastPage.pagination.page + 1
            : undefined,
      },
      query: ({ queryArg: customerId, pageParam }) => ({
        url: ApiUrls.JOBS_BY_CUSTOMER(customerId),
        params: { page: pageParam, pageSize: 20 },
      }),
      providesTags: () => ApiUtils.listTags(TagTypes.JOBS),
    }),
    repeatJob: builder.mutation({
      query: (jobId) => ({ url: ApiUrls.JOB_REPEAT(jobId), method: "post" }),
      invalidatesTags: (result, error, arg) => [
        ...ApiUtils.entityTags(TagTypes.JOBS)(result, error, arg),
        ...ApiUtils.listTags(TagTypes.JOBS),
        ...ApiUtils.listTags(TagTypes.DASHBOARD),
      ],
    }),
    deleteJob: builder.mutation({
      query: (id) => ({ url: ApiUrls.JOB_BY_ID(id), method: "delete" }),
      invalidatesTags: (result, error, arg) => [
        { type: TagTypes.JOBS, id: arg },
        ...ApiUtils.listTags(TagTypes.JOBS),
        ...ApiUtils.listTags(TagTypes.DASHBOARD),
      ],
    }),
    reopenJob: builder.mutation({
      query: (id) => ({ url: ApiUrls.JOB_REOPEN(id), method: "post" }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const job = data?.data;
          if (job?._id && new Date(job.serviceDate) > new Date()) {
            await NotificationUtils.scheduleJobReminders(job);
          }
        } catch {
          // Notification errors must not break the reopen flow
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: TagTypes.JOBS, id: arg },
        ...ApiUtils.listTags(TagTypes.JOBS),
        ...ApiUtils.listTags(TagTypes.DASHBOARD),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetJobsQuery,
  useLazyGetJobsQuery,
  useGetJobsPagedInfiniteQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useGetJobByIdQuery,
  useGetRecentOrganizationsQuery,
  useGetRecentAppliancesQuery,
  useGetJobsByCustomerQuery,
  useGetJobsByCustomerPagedInfiniteQuery,
  useRepeatJobMutation,
  useDeleteJobMutation,
  useReopenJobMutation,
} = jobApi;
