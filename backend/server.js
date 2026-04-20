import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/socket.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

connectDB();

server.listen(PORT, () => {
  console.log(`🚀 AxonX Backend running on http://localhost:${PORT}`);
});