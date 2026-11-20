const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const appointmentRoutes = require("./routes/appointmentRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

// Connect MongoDB Atlas
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

// Rate Limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "Too many requests. Please try again later."
}));

// Routes
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Wedding Planner API is running!"
    });
});

app.use("/api/appointments", appointmentRoutes);
app.use("/api/contact", contactRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});