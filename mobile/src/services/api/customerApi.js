import api from "../api";
import { ApiUrls } from "../../constants/appConstants";
import { TagTypes } from "../../constants/apiTags";
import ApiUtils from "./apiUtils";

export const customerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params) => ({ url: ApiUrls.CUSTOMERS_SEARCH, params }),
      providesTags: (result, error, arg) => ApiUtils.paginatedTags(TagTypes.CUSTOMERS)(result, error, arg),
    }),
    upsertCustomer: builder.mutation({
      query: (body) => ({ url: ApiUrls.CUSTOMERS_UPSERT, method: "post", data: body }),
      invalidatesTags: (result, error, arg) => [
        ...ApiUtils.entityTags(TagTypes.CUSTOMERS)(result, error, arg),
        ...ApiUtils.listTags(TagTypes.CUSTOMERS),
        ...ApiUtils.listTags(TagTypes.JOBS),
        ...ApiUtils.listTags(TagTypes.DASHBOARD),
      ],
    }),
    getCustomerById: builder.query({
      query: (id) => ({ url: ApiUrls.CUSTOMER_BY_ID(id) }),
      providesTags: (result, error, arg) => ApiUtils.entityTags(TagTypes.CUSTOMERS)(result, error, arg),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useUpsertCustomerMutation,
  useGetCustomerByIdQuery,
} = customerApi;
