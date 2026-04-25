import axios, { isCancel } from "axios";
import { API_BASE_URL } from "@config/apiConfig";
import StorageUtils from "@utils/storageUtils";

const customBaseQuery = () => async (rawArgs, api) => {
  const args = typeof rawArgs === "string" ? { url: rawArgs } : rawArgs;
  const { url = "", method = "get", params, data } = args;

  const token = await StorageUtils.getToken();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    const response = await axios({
      url: API_BASE_URL + url,
      method,
      params,
      data,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-Timezone": timezone,
      },
      signal: api.signal,
    });
    return { data: response.data };
  } catch (error) {
    if (isCancel(error)) throw error;

    const status = error.response?.status;

    // Token expired or revoked — clear credentials and redirect to login
    // Only do this for explicit 401s, NOT for network errors (offline)
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
