import api from "../api";
import { ApiUrls } from "@constants/appConstants";
import { TagTypes } from "@constants/apiTags";
import ApiUtils from "@services/api/apiUtils";

export const customerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params) => ({ url: ApiUrls.CUSTOMERS_SEARCH, params }),
      providesTags: (result, error, arg) =>
        ApiUtils.paginatedTags(TagTypes.CUSTOMERS)(result, error, arg),
    }),
    // Infinite-scroll variant used by CustomerListScreen
    getCustomersPaged: builder.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: 1,
        refetchCachedPages: false, // on any refetch (pull-to-refresh, tag invalidation) restart from page 1
        getNextPageParam: (lastPage) =>
          lastPage.pagination?.hasNext
            ? lastPage.pagination.page + 1
            : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: ApiUrls.CUSTOMERS_SEARCH,
        params: { ...queryArg, page: pageParam, pageSize: 10 },
      }),
      providesTags: () => ApiUtils.listTags(TagTypes.CUSTOMERS),
    }),
    upsertCustomer: builder.mutation({
      query: (body) => ({
        url: ApiUrls.CUSTOMERS_UPSERT,
        method: "post",
        data: body,
      }),
      invalidatesTags: (result, error, arg) => [
        ...ApiUtils.entityTags(TagTypes.CUSTOMERS)(result, error, arg),
        ...ApiUtils.listTags(TagTypes.CUSTOMERS),
        ...ApiUtils.listTags(TagTypes.JOBS),
        ...ApiUtils.listTags(TagTypes.DASHBOARD),
      ],
    }),
    getCustomerById: builder.query({
      query: (id) => ({ url: ApiUrls.CUSTOMER_BY_ID(id) }),
      providesTags: (result, error, arg) =>
        ApiUtils.entityTags(TagTypes.CUSTOMERS)(result, error, arg),
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: ApiUrls.CUSTOMER_BY_ID(id),
        method: "patch",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TagTypes.CUSTOMERS, id },
        ...ApiUtils.listTags(TagTypes.CUSTOMERS),
      ],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({ url: ApiUrls.CUSTOMER_BY_ID(id), method: "delete" }),
      invalidatesTags: (result, error, id) => [
        { type: TagTypes.CUSTOMERS, id },
        ...ApiUtils.listTags(TagTypes.CUSTOMERS),
        ...ApiUtils.listTags(TagTypes.JOBS), // Jobs might be affected if we delete customer
        ...ApiUtils.listTags(TagTypes.DASHBOARD),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomersPagedInfiniteQuery,
  useUpsertCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerByIdQuery,
} = customerApi;
