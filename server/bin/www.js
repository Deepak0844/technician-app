import http from "http";

// App
import app from "#app";

// Config
import Env from "#config/env.js";

const PORT = Env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${Env.NODE_ENV} mode`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw error;
});

export default server;
