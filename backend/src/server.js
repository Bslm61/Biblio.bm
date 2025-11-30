import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import clerkRoutes from "./routes/clerkRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);


app.use(express.json());

// JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

//Clerk Routes
app.use("/api/clerk", clerkRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    message: "✅ Backend Running",
    database:
      mongoose.connection.readyState === 1 ? "✅connected" : "❌disconnected",
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

//404 HANDLER
 app.use((req, res) => {
    res.status(404).json({
      error: "Route not found",
      status: 404,
      path: req.path,
    });
  });

// Error 500 Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Server Error",
    status: err.status || 500,
  });
});


//START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});


export default app;