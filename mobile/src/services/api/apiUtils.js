/**
 * API Utilities for parameter serialization and RTK Query cache tagging.
 * Exact same setup as cloud-drive project for consistency.
 */
import { TagIds } from "../../constants/apiTags";

function convertFalseToString(params, key) {
  if (params[key] === false) {
    params[key] = "false";
  }
}

function convertStringToFalse(params, key) {
  if (params[key] === "false") {
    params[key] = false;
  }
}

function serializeParams(params) {
  if (!params) return "";

  let options = "";
  for (const key in params) {
    convertFalseToString(params, key);
    if ((typeof params[key] !== "object" || params[key] === null) && params[key] !== undefined) {
      if (params[key] === null) {
        options += `${key}=null&`;
      } else {
        convertStringToFalse(params, key);
        options += `${key}=${params[key]}&`;
      }
    } else if (typeof params[key] === "object" && params[key] && params[key].length) {
      params[key].forEach((el) => (options += `${key}=${el}&`));
    }
  }
  return options ? options.slice(0, -1) : options;
}

function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj || {}).sort());
}

/**
 * Generates tags for paginated or list queries.
 */
function paginatedTags(type) {
  return (result, error, args) => {
    const pageTag = {
      type,
      id: `PAGE-${args?.pageNumber || 1}-${args?.pageSize || 20}-${stableStringify(args?.params || {})}`,
    };

    if (!result?.data) {
      return [{ type, id: TagIds.LIST }, pageTag];
    }

    let list = [];
    if (Array.isArray(result.data)) list = result.data;
    else if (result.data.list && Array.isArray(result.data.list)) list = result.data.list;
    else if (result.data.jobs && Array.isArray(result.data.jobs)) list = result.data.jobs;
    else if (result.data.customers && Array.isArray(result.data.customers)) list = result.data.customers;

    if (!list.length) {
      return [{ type, id: TagIds.LIST }, pageTag];
    }

    return [
      { type, id: TagIds.LIST },
      pageTag,
      ...list.map((item) => ({ type, id: item._id || item.id })),
    ];
  };
}

/**
 * Generates tags for queries that return a single entity or mutations that affect a single entity.
 */
function entityTags(type) {
  return (result, _error, args) => {
    // 1. Check result first (most reliable for mutation success)
    let id = result?.data?._id || result?.data?.id || result?._id || result?.id;

    // 2. Check args (for queries or if result is partial/fails)
    if (!id && args) {
      id = typeof args === 'string' ? args : args.id || args._id;
    }

    if (!id) return [];
    return [{ type, id }];
  };
}

/**
 * Generates simple list tags.
 */
function listTags(type, id = TagIds.LIST) {
  return [{ type, id }];
}

/**
 * Shared sequence for paginated queries.
 */
function serializePaginatedQueryArgs({ endpointName, queryArgs }) {
  const { pg: _pg, ...rest } = queryArgs || {};
  return `${endpointName}-${stableStringify(rest)}`;
}

/**
 * Shared caching merge algorithm for infinite scrolling.
 */
function mergePaginatedArrays() {
  return (currentCache, newItems, { arg }) => {
    if (!arg?.pg || arg.pg === 1) return newItems;

    if (Array.isArray(newItems)) {
      const currentData = Array.isArray(currentCache) ? currentCache : [];
      return [...currentData, ...newItems];
    }

    const merged = { ...newItems };
    const cacheObj = currentCache || {};

    Object.keys(newItems).forEach((key) => {
      if (Array.isArray(newItems[key])) {
        merged[key] = [...(cacheObj[key] || []), ...newItems[key]];
      }
    });

    return merged;
  };
}

const ApiUtils = {
  paginatedTags,
  entityTags,
  listTags,
  serializeParams,
  serializePaginatedQueryArgs,
  mergePaginatedArrays,
};

export default ApiUtils;
