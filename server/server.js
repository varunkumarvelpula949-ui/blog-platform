const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 5
    });

    console.log("MongoDB connected successfully");
};

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/PostRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error.message);

        return res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
}, authRoutes);

app.use("/api/posts", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error.message);

        return res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
}, postRoutes);

app.use("/api/admin", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error.message);

        return res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
}, adminRoutes);

app.get("/", async (req, res) => {
    res.json({
        message: "Blog Platform API is running successfully"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        await connectDB();

        res.json({
            status: "OK",
            database: "connected"
        });
    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            database: "disconnected",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;