import axios, { isCancel } from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import StorageUtils from "../utils/storageUtils";
import { clearCredentials } from "../store/slices/authSlice";

const customBaseQuery = () => async (rawArgs, api) => {
  const args = typeof rawArgs === "string" ? { url: rawArgs } : rawArgs;
  const { url = "", method = "get", params, data } = args;

  const token = await StorageUtils.getToken();

  try {
    const response = await axios({
      url: API_BASE_URL + url,
      method,
      params,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: api.signal,
    });
    return { data: response.data };
  } catch (error) {
    if (isCancel(error)) throw error;

    // Token expired or revoked — clear credentials and redirect to login
    if (error.response?.status === 401) {
      await StorageUtils.clearToken();
      api.dispatch(clearCredentials());
    }

    return {
      error: {
        status: error.response?.status,
        data: error.response?.data || error.message,
      },
    };
  }
};

export default customBaseQuery;
