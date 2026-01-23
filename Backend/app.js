import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL]
    : [process.env.CORS_ORIGIN];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

import demoRoutes from "./src/routes/demo.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import studentRoutes from "./src/routes/student.routes.js";
import subscriptionRoutes from "./src/routes/subscription.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import intelligenceRoutes from "./src/routes/intelligence.routes.js";
import assistantRoutes from "./src/routes/assistant.routes.js";
import coachRoutes from "./src/routes/coach.routes.js";
import batchRoutes from "./src/routes/batch.routes.js";
import classRoutes from "./src/routes/class.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import coachPayoutroutes from "./src/routes/coachPayout.routes.js";

app.use("/api/classes", classRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/demos", demoRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/coachPayout", coachPayoutroutes);


export { app };
