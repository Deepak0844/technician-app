import api from "../api";
import { ApiUrls } from "../../constants/appConstants";
import { TagTypes, TagIds } from "../../constants/apiTags";
import ApiUtils from "./apiUtils";

const authEndpoints = {
  sendOtp: (builder) =>
    builder.mutation({
      query: (body) => ({ url: ApiUrls.AUTH_SEND_OTP, method: "post", data: body }),
    }),
  verifyOtp: (builder) =>
    builder.mutation({
      query: (body) => ({ url: ApiUrls.AUTH_VERIFY_OTP, method: "post", data: body }),
    }),
  logout: (builder) =>
    builder.mutation({
      query: () => ({ url: ApiUrls.AUTH_LOGOUT, method: "post" }),
    }),
  getMe: (builder) =>
    builder.query({
      query: () => ({ url: ApiUrls.AUTH_ME }),
      providesTags: (result, error, arg) => ApiUtils.listTags(TagTypes.AUTH, TagIds.ME),
    }),
  updateMe: (builder) =>
    builder.mutation({
      query: (body) => ({ url: ApiUrls.AUTH_UPDATE_ME, method: "put", data: body }),
      invalidatesTags: () => ApiUtils.listTags(TagTypes.AUTH, TagIds.ME),
    }),
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: authEndpoints.sendOtp(builder),
    verifyOtp: authEndpoints.verifyOtp(builder),
    logout: authEndpoints.logout(builder),
    getMe: authEndpoints.getMe(builder),
    updateMe: authEndpoints.updateMe(builder),
  }),
  overrideExisting: false,
});

export const { useSendOtpMutation, useVerifyOtpMutation, useLogoutMutation, useGetMeQuery, useUpdateMeMutation } = authApi;
