/**
 * API base URL — dev uses local machine IP, prod uses deployed server
 *
 * IMPORTANT: Change the DEV IP to your local machine's IP address
 * when testing on a physical device (not emulator).
 * Find it with: ifconfig | grep "inet " (Mac/Linux)
 */
const API_BASE_URL = __DEV__
  ? "http://192.168.29.236:9000/api/v1" // Match server .env port
  : "https://your-api.yourdomain.com/api/v1";

export { API_BASE_URL };
