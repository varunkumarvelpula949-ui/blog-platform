const express = require("express");
const jwt = require("jsonwebtoken");
const Comment = require("../models/Comment");

const router = express.Router();

// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================
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
                message: "Token missing"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {
        console.error("AUTH ERROR:", error);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// ===============================
// GET COMMENTS FOR A POST
// ===============================
router.get("/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({
            post: req.params.postId
        })
            .populate("user", "name username")
            .sort({ createdAt: -1 });

        res.json(comments);

    } catch (error) {
        console.error("GET COMMENTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch comments"
        });
    }
});

// ===============================
// ADD COMMENT
// ===============================
router.post("/:postId", auth, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const comment = new Comment({
            text: text.trim(),
            post: req.params.postId,
            user: req.userId
        });

        const savedComment = await comment.save();

        const populatedComment = await savedComment.populate(
            "user",
            "name username"
        );

        res.status(201).json(populatedComment);

    } catch (error) {
        console.error("ADD COMMENT ERROR:", error);

        res.status(500).json({
            message: "Failed to add comment"
        });
    }
});

// ===============================
// DELETE COMMENT
// ===============================
router.delete("/:id", auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // Only the comment owner can delete it
        if (comment.user.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "You can only delete your own comments"
            });
        }

        await Comment.findByIdAndDelete(req.params.id);

        res.json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error("DELETE COMMENT ERROR:", error);

        res.status(500).json({
            message: "Failed to delete comment"
        });
    }
});

module.exports = router;