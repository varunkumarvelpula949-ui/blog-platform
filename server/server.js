const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/PostRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Blog Platform API is running successfully"
    });
});

app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

module.exports = app;