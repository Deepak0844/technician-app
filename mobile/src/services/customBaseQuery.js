import axios, { isCancel } from "axios";
import { API_BASE_URL } from "@config/apiConfig";
import { ApiUrls } from "@constants/appConstants";
import StorageUtils from "@utils/storageUtils";

// Endpoints whose 401 means "bad credentials" or "session already over", not
// "access token expired" — refreshing for them would only rotate the token.
const NO_REFRESH_URLS = [
  ApiUrls.AUTH_SEND_OTP,
  ApiUrls.AUTH_VERIFY_OTP,
  ApiUrls.AUTH_REFRESH,
  ApiUrls.AUTH_LOGOUT,
];

// Single in-flight refresh shared by every request that hits a 401 at once,
// so a rotating refresh token is never spent twice.
let refreshPromise = null;

/**
 * Exchange the stored refresh token for a new token pair and persist it.
 * Resolves to the new access token, or null if the session can't be renewed.
 * Only an explicit rejection (400/401) ends the session; any other failure
 * rejects so the caller can keep the user logged in (offline, rate limit, 5xx).
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
        // The old refresh token is spent, so persist the new pair first. A
        // storage failure must not drop this request; the server's short
        // reuse grace window only covers an immediate retry.
        await Promise.all([
          StorageUtils.saveToken(token),
          StorageUtils.saveRefreshToken(newRefreshToken),
        ]).catch(() => {});
        return token;
      } catch (error) {
        // Only an explicit rejection ends the session; 429/5xx/network
        // errors are transient, so keep the user signed in.
        if ([400, 401].includes(error.response?.status)) return null;
        throw error;
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

  const sendWithToken = (token) =>
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
      response = await sendWithToken(await StorageUtils.getToken());
    } catch (error) {
      const canRefresh =
        error.response?.status === 401 && !NO_REFRESH_URLS.includes(url);
      if (!canRefresh) throw error;

      // Access token expired/revoked: renew once and retry the request.
      const newToken = await refreshAccessToken();
      if (!newToken) throw error;
      response = await sendWithToken(newToken);
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
      await StorageUtils.clearTokens();
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
