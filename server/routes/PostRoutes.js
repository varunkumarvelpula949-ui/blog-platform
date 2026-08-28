const express = require("express");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");

const router = express.Router();

// =========================
// AUTHENTICATION MIDDLEWARE
// =========================

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization token required"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// =========================
// GET ALL POSTS
// =========================

router.get("/", async (req, res) => {
    try {

        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {

        console.error("Get posts error:", error);

        res.status(500).json({
            message: "Failed to get posts",
            error: error.message
        });
    }
});

// =========================
// GET SINGLE POST
// =========================

router.get("/:id", async (req, res) => {
    try {

        const post = await Post.findById(
            req.params.id
        ).populate("author", "name email");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.status(200).json(post);

    } catch (error) {

        console.error("Get post error:", error);

        res.status(500).json({
            message: "Failed to get post",
            error: error.message
        });
    }
});

// =========================
// CREATE POST
// =========================

router.post("/", auth, async (req, res) => {
    try {

        const { title, content } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                message: "Post title is required"
            });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = await Post.create({
            title: title.trim(),
            content: content.trim(),
            author: req.userId
        });

        const populatedPost = await Post.findById(
            post._id
        ).populate("author", "name email");

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        });

    } catch (error) {

        console.error("Create post error:", error);

        res.status(500).json({
            message: "Failed to create post",
            error: error.message
        });
    }
});

// =========================
// EDIT POST
// =========================

router.put("/:id", auth, async (req, res) => {
    try {

        const { title, content } = req.body;

        const post = await Post.findById(
            req.params.id
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Only post owner can edit
        if (
            post.author.toString() !==
            req.userId.toString()
        ) {
            return res.status(403).json({
                message: "You can only edit your own posts"
            });
        }

        if (title !== undefined) {
            post.title = title.trim();
        }

        if (content !== undefined) {
            post.content = content.trim();
        }

        await post.save();

        const updatedPost = await Post.findById(
            post._id
        ).populate("author", "name email");

        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost
        });

    } catch (error) {

        console.error("Update post error:", error);

        res.status(500).json({
            message: "Failed to update post",
            error: error.message
        });
    }
});

// =========================
// DELETE POST
// =========================

router.delete("/:id", auth, async (req, res) => {
    try {

        const post = await Post.findById(
            req.params.id
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Only post owner can delete
        if (
            post.author.toString() !==
            req.userId.toString()
        ) {
            return res.status(403).json({
                message: "You can only delete your own posts"
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {

        console.error("Delete post error:", error);

        res.status(500).json({
            message: "Failed to delete post",
            error: error.message
        });
    }
});

module.exports = router;