import api from "../api";
import { ApiUrls } from "@constants/appConstants";
import { TagTypes, TagIds } from "@constants/apiTags";
import ApiUtils from "@services/api/apiUtils";

const authEndpoints = {
  sendOtp: (builder) =>
    builder.mutation({
      query: (body) => ({
        url: ApiUrls.AUTH_SEND_OTP,
        method: "post",
        data: body,
      }),
    }),
  verifyOtp: (builder) =>
    builder.mutation({
      query: (body) => ({
        url: ApiUrls.AUTH_VERIFY_OTP,
        method: "post",
        data: body,
      }),
    }),
  logout: (builder) =>
    builder.mutation({
      query: () => ({ url: ApiUrls.AUTH_LOGOUT, method: "post" }),
    }),
  getMe: (builder) =>
    builder.query({
      query: () => ({ url: ApiUrls.AUTH_ME }),
      providesTags: (result, error, arg) =>
        ApiUtils.listTags(TagTypes.AUTH, TagIds.ME),
    }),
  updateMe: (builder) =>
    builder.mutation({
      query: (body) => ({
        url: ApiUrls.AUTH_UPDATE_ME,
        method: "put",
        data: body,
      }),
      invalidatesTags: () => ApiUtils.listTags(TagTypes.AUTH, TagIds.ME),
    }),
  uploadLogo: (builder) =>
    builder.mutation({
      query: (formData) => ({
        url: ApiUrls.AUTH_UPLOAD_LOGO,
        method: "post",
        data: formData,
      }),
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
    uploadLogo: authEndpoints.uploadLogo(builder),
  }),
  overrideExisting: false,
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useUploadLogoMutation,
} = authApi;
