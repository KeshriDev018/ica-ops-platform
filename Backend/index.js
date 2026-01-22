import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import http from "http";
import { app } from "./app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/socket/chatSocket.js";

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);

// Make io accessible to routes if needed
app.set("io", io);

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;

    httpServer.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
      console.log(`WebSocket server initialized`);
    });
  })
  .catch((error) => {
    console.error("MONGO db connection failed !!!", error);
  });
