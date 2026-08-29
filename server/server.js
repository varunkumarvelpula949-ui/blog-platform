const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

let isConnecting = false;

async function connectDB() {
    // Already connected
    if (mongoose.connection.readyState === 1) {
        return true;
    }

    // Prevent multiple simultaneous connections
    if (isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return mongoose.connection.readyState === 1;
    }

    isConnecting = true;

    try {
        let uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error("MONGO_URI environment variable is missing");
        }

        // Clean accidental spaces/quotes
        uri = uri.trim().replace(/^["']|["']$/g, "");

        // If accidentally pasted as MONGO_URI=xxxxx, fix it
        if (uri.startsWith("MONGO_URI=")) {
            uri = uri.substring("MONGO_URI=".length).trim();
        }

        // Check MongoDB URI format
        if (
            !uri.startsWith("mongodb://") &&
            !uri.startsWith("mongodb+srv://")
        ) {
            throw new Error(
                "Invalid MONGO_URI. It must start with mongodb:// or mongodb+srv://"
            );
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            maxPoolSize: 5
        });

        console.log("MongoDB connected successfully");

        return true;
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        return false;
    } finally {
        isConnecting = false;
    }
}

// =========================
// ROUTES
// =========================

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/PostRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Connect before database routes
app.use("/api/auth", async (req, res, next) => {
    const connected = await connectDB();

    if (!connected) {
        return res.status(500).json({
            message: "Database connection failed"
        });
    }

    next();
}, authRoutes);

app.use("/api/posts", async (req, res, next) => {
    const connected = await connectDB();

    if (!connected) {
        return res.status(500).json({
            message: "Database connection failed"
        });
    }

    next();
}, postRoutes);

app.use("/api/comments", async (req, res, next) => {
    const connected = await connectDB();

    if (!connected) {
        return res.status(500).json({
            message: "Database connection failed"
        });
    }

    next();
}, commentRoutes);

app.use("/api/admin", async (req, res, next) => {
    const connected = await connectDB();

    if (!connected) {
        return res.status(500).json({
            message: "Database connection failed"
        });
    }

    next();
}, adminRoutes);

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "Blog Platform API is running successfully"
    });
});

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", async (req, res) => {
    const connected = await connectDB();

    if (connected) {
        return res.status(200).json({
            status: "OK",
            database: "connected"
        });
    }

    return res.status(500).json({
        status: "ERROR",
        database: "disconnected"
    });
});

// =========================
// LOCAL SERVER
// =========================

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;