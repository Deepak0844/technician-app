import axios, { isCancel } from "axios";
import { API_BASE_URL } from "@config/apiConfig";
import StorageUtils from "@utils/storageUtils";

const customBaseQuery = () => async (rawArgs, api) => {
  const args = typeof rawArgs === "string" ? { url: rawArgs } : rawArgs;
  const {
    url = "",
    method = "get",
    params,
    data,
    headers: callerHeaders,
  } = args;

  const token = await StorageUtils.getToken();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Axios 1.x has a known bug with React Native FormData causing NETWORK_ERROR.
  // The fix requires setting transformRequest to bypass Axios's default serializer
  // ONLY for FormData, while letting it naturally set the multipart boundary.
  const isFormData = data != null && typeof data.append === "function";

  try {
    const response = await axios({
      url: API_BASE_URL + url,
      method,
      params,
      data,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-Timezone": timezone,
        ...callerHeaders,
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
      },
      ...(isFormData ? { transformRequest: (d) => d } : {}),
      signal: api.signal,
    });
    return { data: response.data };
  } catch (error) {
    if (isCancel(error)) throw error;

    const status = error.response?.status;
    if (__DEV__) {
      console.error("[customBaseQuery] error", {
        status,
        message: error.message,
        isAxiosError: error.isAxiosError,
      });
    }

    if (status === 401) {
      await StorageUtils.clearToken();
      api.dispatch({ type: "auth/clearCredentials" });
    }

    return {
      error: {
        status: status ?? "NETWORK_ERROR",
        data: error.response?.data || error.message,
      },
    };
  }
};

export default customBaseQuery;
