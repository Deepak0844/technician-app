import api from "@services/api";
import { ApiUrls } from "@constants/appConstants";
import { TagTypes } from "@constants/apiTags";
import ApiUtils from "@services/api/apiUtils";

export const jobApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query({
      query: (params) => ({ url: ApiUrls.JOBS, params }),
      providesTags: ApiUtils.paginatedTags(TagTypes.JOBS),
    }),
    createJob: builder.mutation({
      query: (body) => ({ url: ApiUrls.JOBS, method: "post", data: body }),
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
    getJobsByCustomer: builder.query({
      query: (customerId) => ({ url: ApiUrls.JOBS_BY_CUSTOMER(customerId) }),
      providesTags: ApiUtils.paginatedTags(TagTypes.JOBS),
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
  }),
  overrideExisting: false,
});

export const {
  useGetJobsQuery,
  useLazyGetJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useGetJobByIdQuery,
  useGetJobsByCustomerQuery,
  useRepeatJobMutation,
  useDeleteJobMutation,
} = jobApi;
