import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState({});
    const [commentText, setCommentText] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    const token = localStorage.getItem("token");

    // ===============================
    // GET COMMENTS
    // ===============================

    const getComments = useCallback(async (postId) => {
        try {
            const response = await axios.get(
                `${API_URL}/api/comments/${postId}`
            );

            setComments((previous) => ({
                ...previous,
                [postId]: response.data,
            }));
        } catch (err) {
            console.error("GET COMMENTS ERROR:", err);
        }
    }, []);

    // ===============================
    // GET POSTS
    // ===============================

    const getPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/api/posts`
            );

            setPosts(response.data);

            response.data.forEach((post) => {
                getComments(post._id);
            });
        } catch (err) {
            console.error("GET POSTS ERROR:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to load posts."
            );
        } finally {
            setLoading(false);
        }
    }, [getComments]);

    // ===============================
    // LOAD POSTS
    // ===============================

    useEffect(() => {
        getPosts();
    }, [getPosts]);

    // ===============================
    // CREATE POST
    // ===============================

    const createPost = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert("Please enter title and content.");
            return;
        }

        if (!token) {
            alert("Please login first.");
            return;
        }

        try {
            await axios.post(
                `${API_URL}/api/posts`,
                {
                    title,
                    content,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTitle("");
            setContent("");

            await getPosts();

            alert("Post created successfully!");
        } catch (err) {
            console.error("CREATE POST ERROR:", err);

            alert(
                err.response?.data?.message ||
                    "Unable to create post."
            );
        }
    };

    // ===============================
    // DELETE POST
    // ===============================

    const deletePost = async (id) => {
        if (!token) {
            alert("Please login first.");
            return;
        }

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this post?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(
                `${API_URL}/api/posts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await getPosts();

            alert("Post deleted successfully!");
        } catch (err) {
            console.error("DELETE POST ERROR:", err);

            alert(
                err.response?.data?.message ||
                    "Unable to delete post."
            );
        }
    };

    // ===============================
    // START EDIT
    // ===============================

    const startEdit = (post) => {
        setEditingId(post._id);
        setEditTitle(post.title);
        setEditContent(post.content);
    };

    // ===============================
    // CANCEL EDIT
    // ===============================

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
    };

    // ===============================
    // UPDATE POST
    // ===============================

    const updatePost = async (id) => {
        if (!editTitle.trim() || !editContent.trim()) {
            alert("Title and content cannot be empty.");
            return;
        }

        if (!token) {
            alert("Please login first.");
            return;
        }

        try {
            await axios.put(
                `${API_URL}/api/posts/${id}`,
                {
                    title: editTitle,
                    content: editContent,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            cancelEdit();

            await getPosts();

            alert("Post updated successfully!");
        } catch (err) {
            console.error("UPDATE POST ERROR:", err);

            alert(
                err.response?.data?.message ||
                    "Unable to update post."
            );
        }
    };

    // ===============================
    // ADD COMMENT
    // ===============================

    const addComment = async (postId) => {
        const text = commentText[postId]?.trim();

        if (!text) {
            alert("Please enter a comment.");
            return;
        }

        if (!token) {
            alert("Please login to comment.");
            return;
        }

        try {
            await axios.post(
                `${API_URL}/api/comments/${postId}`,
                {
                    text,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCommentText((previous) => ({
                ...previous,
                [postId]: "",
            }));

            await getComments(postId);
        } catch (err) {
            console.error("ADD COMMENT ERROR:", err);

            alert(
                err.response?.data?.message ||
                    "Unable to add comment."
            );
        }
    };

    // ===============================
    // DELETE COMMENT
    // ===============================

    const deleteComment = async (commentId, postId) => {
        if (!token) {
            alert("Please login first.");
            return;
        }

        const confirmDelete = window.confirm(
            "Delete this comment?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(
                `${API_URL}/api/comments/${commentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await getComments(postId);
        } catch (err) {
            console.error("DELETE COMMENT ERROR:", err);

            alert(
                err.response?.data?.message ||
                    "Unable to delete comment."
            );
        }
    };

    // ===============================
    // LOGOUT
    // ===============================

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.reload();
    };

    return (
        <div className="app">

            {/* ================= NAVBAR ================= */}

            <header className="navbar">
                <div className="logo">
                    <span>Blog</span>Sphere
                </div>

                <nav>
                    <a href="#home">Home</a>

                    <a href="#create">
                        Create Post
                    </a>

                    <a href="#posts">
                        Posts
                    </a>

                    {token ? (
                        <button
                            className="logout-btn"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    ) : (
                        <a
                            href="/login"
                            className="login-btn"
                        >
                            Login
                        </a>
                    )}
                </nav>
            </header>

            {/* ================= HERO ================= */}

            <section
                className="hero"
                id="home"
            >
                <div className="hero-content">

                    <p className="hero-small">
                        WELCOME TO BLOGSPHERE
                    </p>

                    <h1>
                        Share Your
                        <span> Stories.</span>
                    </h1>

                    <p className="hero-description">
                        Write, publish and connect with
                        people through meaningful stories
                        and ideas.
                    </p>

                    <a
                        href="#create"
                        className="hero-button"
                    >
                        Start Writing
                    </a>

                </div>
            </section>

            {/* ================= CREATE POST ================= */}

            <section
                className="create-section"
                id="create"
            >
                <div className="section-heading">

                    <p>
                        CREATE SOMETHING AMAZING
                    </p>

                    <h2>
                        Write a New Post
                    </h2>

                </div>

                {!token ? (
                    <div className="login-message">

                        <h3>
                            Login Required
                        </h3>

                        <p>
                            Login before creating a
                            blog post.
                        </p>

                        <a href="/login">
                            Login Now
                        </a>

                    </div>
                ) : (
                    <form
                        className="post-form"
                        onSubmit={createPost}
                    >

                        <div className="input-group">

                            <label>
                                Post Title
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your post title..."
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="input-group">

                            <label>
                                Content
                            </label>

                            <textarea
                                placeholder="Write your story..."
                                value={content}
                                onChange={(e) =>
                                    setContent(
                                        e.target.value
                                    )
                                }
                                rows="8"
                            />

                        </div>

                        <button
                            type="submit"
                            className="publish-btn"
                        >
                            Publish Post
                        </button>

                    </form>
                )}
            </section>

            {/* ================= POSTS ================= */}

            <section
                className="posts-section"
                id="posts"
            >

                <div className="section-heading">

                    <p>
                        EXPLORE STORIES
                    </p>

                    <h2>
                        Latest Posts
                    </h2>

                </div>

                {loading && (
                    <div className="loading">
                        Loading posts...
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    posts.length === 0 && (
                        <div className="empty-posts">

                            <h3>
                                No posts yet
                            </h3>

                            <p>
                                Be the first person to
                                publish a story.
                            </p>

                        </div>
                    )}

                <div className="posts-grid">

                    {posts.map((post) => (

                        <article
                            className="post-card"
                            key={post._id}
                        >

                            {editingId === post._id ? (

                                /* ================= EDIT POST ================= */

                                <div className="edit-form">

                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) =>
                                            setEditTitle(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <textarea
                                        value={editContent}
                                        onChange={(e) =>
                                            setEditContent(
                                                e.target.value
                                            )
                                        }
                                        rows="7"
                                    />

                                    <div className="edit-buttons">

                                        <button
                                            onClick={() =>
                                                updatePost(
                                                    post._id
                                                )
                                            }
                                            className="save-btn"
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={
                                                cancelEdit
                                            }
                                            className="cancel-btn"
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </div>

                            ) : (

                                /* ================= NORMAL POST ================= */

                                <>

                                    <div className="post-number">
                                        BLOG
                                    </div>

                                    <h3>
                                        {post.title}
                                    </h3>

                                    <p className="post-content">
                                        {post.content}
                                    </p>

                                    <div className="post-footer">

                                        <span>
                                            {post.author?.name ||
                                                post.author?.username ||
                                                "Anonymous"}
                                        </span>

                                        <div className="post-actions">

                                            {token && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            startEdit(
                                                                post
                                                            )
                                                        }
                                                        className="edit-btn"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            deletePost(
                                                                post._id
                                                            )
                                                        }
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}

                                        </div>

                                    </div>

                                    {/* ================= COMMENTS ================= */}

                                    <div className="comments-section">

                                        <h4>
                                            Comments
                                        </h4>

                                        <div className="comment-list">

                                            {comments[
                                                post._id
                                            ]?.length > 0 ? (

                                                comments[
                                                    post._id
                                                ].map(
                                                    (comment) => (

                                                        <div
                                                            className="comment"
                                                            key={
                                                                comment._id
                                                            }
                                                        >

                                                            <div>

                                                                <strong>
                                                                    {comment
                                                                        .user
                                                                        ?.name ||
                                                                        comment
                                                                            .user
                                                                            ?.username ||
                                                                        "User"}
                                                                </strong>

                                                                <p>
                                                                    {
                                                                        comment.text
                                                                    }
                                                                </p>

                                                            </div>

                                                            {token && (
                                                                <button
                                                                    className="comment-delete"
                                                                    onClick={() =>
                                                                        deleteComment(
                                                                            comment._id,
                                                                            post._id
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}

                                                        </div>

                                                    )
                                                )

                                            ) : (

                                                <p className="no-comments">
                                                    No comments yet.
                                                </p>

                                            )}

                                        </div>

                                        {token ? (

                                            <div className="comment-form">

                                                <input
                                                    type="text"
                                                    placeholder="Write a comment..."
                                                    value={
                                                        commentText[
                                                            post._id
                                                        ] || ""
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setCommentText(
                                                            (
                                                                previous
                                                            ) => ({
                                                                ...previous,
                                                                [post._id]:
                                                                    e
                                                                        .target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    onKeyDown={(
                                                        e
                                                    ) => {

                                                        if (
                                                            e.key ===
                                                            "Enter"
                                                        ) {
                                                            e.preventDefault();

                                                            addComment(
                                                                post._id
                                                            );
                                                        }

                                                    }}
                                                />

                                                <button
                                                    onClick={() =>
                                                        addComment(
                                                            post._id
                                                        )
                                                    }
                                                >
                                                    Comment
                                                </button>

                                            </div>

                                        ) : (

                                            <p className="login-comment">
                                                Login to comment.
                                            </p>

                                        )}

                                    </div>

                                </>

                            )}

                        </article>

                    ))}

                </div>

            </section>

            {/* ================= FOOTER ================= */}

            <footer className="footer">

                <div className="footer-logo">
                    <span>Blog</span>Sphere
                </div>

                <p>
                    Share ideas. Inspire people.
                    Build connections.
                </p>

                <p className="copyright">
                    © 2026 BlogSphere. All rights reserved.
                </p>

            </footer>

        </div>
    );
}

export default App;