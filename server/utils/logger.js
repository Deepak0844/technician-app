import pino from "pino";

// Config
import Env from "#config/env.js";

const logger = pino(
  {
    level: Env.NODE_ENV === "production" ? "info" : "debug",
    base: { pid: false },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  Env.NODE_ENV === "production"
    ? undefined
    : pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss",
          ignore: "pid,hostname",
        },
      })
);

export default logger;
