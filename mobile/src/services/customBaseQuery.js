import axios, { isCancel } from "axios";
import { API_BASE_URL } from "@config/apiConfig";
import { ApiUrls } from "@constants/appConstants";
import StorageUtils from "@utils/storageUtils";

// Endpoints whose 401 means "bad credentials", not "access token expired".
const NO_REFRESH_URLS = [
  ApiUrls.AUTH_SEND_OTP,
  ApiUrls.AUTH_VERIFY_OTP,
  ApiUrls.AUTH_REFRESH,
];

// Single in-flight refresh shared by every request that hits a 401 at once,
// so a rotating refresh token is never spent twice.
let refreshPromise = null;

/**
 * Exchange the stored refresh token for a new token pair and persist it.
 * Resolves to the new access token, or null if the session can't be renewed.
 * Only an explicit rejection from the server ends the session; a network
 * failure rejects so the caller can keep the user logged in (offline use).
 */
function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await StorageUtils.getRefreshToken();
      if (!refreshToken) return null;
      try {
        const response = await axios.post(API_BASE_URL + ApiUrls.AUTH_REFRESH, {
          refreshToken,
        });
        const { token, refreshToken: newRefreshToken } = response.data.data;
        await StorageUtils.saveToken(token);
        await StorageUtils.saveRefreshToken(newRefreshToken);
        return token;
      } catch (error) {
        if (error.response) return null; // server rejected the refresh token
        throw error; // network error
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

const customBaseQuery = () => async (rawArgs, api) => {
  const args = typeof rawArgs === "string" ? { url: rawArgs } : rawArgs;
  const {
    url = "",
    method = "get",
    params,
    data,
    headers: callerHeaders,
  } = args;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Axios 1.x has a known bug with React Native FormData causing NETWORK_ERROR.
  // The fix requires setting transformRequest to bypass Axios's default serializer
  // ONLY for FormData, while letting it naturally set the multipart boundary.
  const isFormData = data != null && typeof data.append === "function";

  const send = (token) =>
    axios({
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

  try {
    let response;
    try {
      response = await send(await StorageUtils.getToken());
    } catch (error) {
      const canRefresh =
        error.response?.status === 401 && !NO_REFRESH_URLS.includes(url);
      if (!canRefresh) throw error;

      // Access token expired/revoked: renew once and retry the request.
      const newToken = await refreshAccessToken();
      if (!newToken) throw error;
      response = await send(newToken);
    }
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
