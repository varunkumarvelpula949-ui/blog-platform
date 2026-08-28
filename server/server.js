const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Routes
const authRoutes = require("./routes/authRoutes");

const postRoutes = require("./routes/PostRoutes");

const commentRoutes = require("./routes/commentRoutes");

const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());

// ===============================
// DATABASE CONNECTION
// ===============================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/admin", adminRoutes);

// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "Blog Platform API is running successfully",
    });
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
        message: "Internal server error",
    });
});

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});