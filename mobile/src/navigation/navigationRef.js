import { createNavigationContainerRef } from "@react-navigation/native";
import { RouteNames } from "@constants/routeNames";

export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to Job Details from outside of a React component
 * (e.g., from a notification tap handler in index.js).
 * Waits until the navigator is ready before dispatching.
 */
export function navigateToJobDetails(jobId) {
  if (!jobId) return;

  if (navigationRef.isReady()) {
    navigationRef.navigate(RouteNames.JOB_DETAILS, { jobId });
  } else {
    // Navigator not ready yet (cold launch from notification) — retry after a short delay
    const interval = setInterval(() => {
      if (navigationRef.isReady()) {
        clearInterval(interval);
        navigationRef.navigate(RouteNames.JOB_DETAILS, { jobId });
      }
    }, 100);

    // Give up after 10 seconds to avoid memory leaks
    setTimeout(() => clearInterval(interval), 10000);
  }
}
