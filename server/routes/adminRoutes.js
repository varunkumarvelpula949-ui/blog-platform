const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const router = express.Router();

// ===============================
// GET ALL USERS
// ===============================

router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select(
            "-password"
        );

        res.json(users);
    } catch (error) {
        console.error("GET USERS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch users",
        });
    }
});

// ===============================
// GET ALL POSTS
// ===============================

router.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error("GET ADMIN POSTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch posts",
        });
    }
});

// ===============================
// DELETE ANY POST
// ===============================

router.delete("/posts/:id", async (req, res) => {
    try {
        const post = await Post.findById(
            req.params.id
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        // Delete comments belonging to this post
        await Comment.deleteMany({
            post: req.params.id,
        });

        res.json({
            message: "Post deleted successfully",
        });
    } catch (error) {
        console.error(
            "ADMIN DELETE POST ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to delete post",
        });
    }
});

// ===============================
// DELETE ANY COMMENT
// ===============================

router.delete(
    "/comments/:id",
    async (req, res) => {
        try {
            const comment =
                await Comment.findById(
                    req.params.id
                );

            if (!comment) {
                return res.status(404).json({
                    message: "Comment not found",
                });
            }

            await Comment.findByIdAndDelete(
                req.params.id
            );

            res.json({
                message:
                    "Comment deleted successfully",
            });
        } catch (error) {
            console.error(
                "ADMIN DELETE COMMENT ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to delete comment",
            });
        }
    }
);

module.exports = router;