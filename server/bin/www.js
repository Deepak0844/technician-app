import http from "http";

// App
import app from "#app";

// Config
import Env from "#config/env.js";

// Utils
import logger from "#utils/logger.js";

const PORT = Env.PORT;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${Env.NODE_ENV} mode`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw error;
});

export default server;
