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
  useUpsertCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerByIdQuery,
} = customerApi;
