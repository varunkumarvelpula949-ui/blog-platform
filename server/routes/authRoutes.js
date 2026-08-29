const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// =========================
// REGISTER
// =========================

router.post("/register", async (req, res) => {
    try {
        console.log("REGISTER REQUEST:", req.body);

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        console.log("Checking existing user...");

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        console.log("Hashing password...");

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Creating user...");

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword
        });

        console.log("USER CREATED:", user._id);

        return res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        console.error("========== REGISTER ERROR ==========");
        console.error(error);
        console.error("====================================");

        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// =========================
// LOGIN
// =========================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT_SECRET is missing"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

module.exports = router;