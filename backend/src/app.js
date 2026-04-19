import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import logger from "./utils/logger.js";

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API ROUTES
app.use("/api", apiRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("🔥 AxonX API is running...");
});

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
  });
});

export default app;