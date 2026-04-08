import axios, { isCancel } from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import StorageUtils from "../utils/storageUtils";

const customBaseQuery =
  () =>
  async (rawArgs, api) => {
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
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || error.message,
        },
      };
    }
  };

export default customBaseQuery;
