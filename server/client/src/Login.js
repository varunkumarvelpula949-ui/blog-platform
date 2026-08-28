import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                {
                    email,
                    password,
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            alert("Login successful!");

            window.location.href = "/";
        } catch (error) {
            console.error("LOGIN ERROR:", error);

            alert(
                error.response?.data?.message ||
                    "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-decoration decoration-one"></div>
            <div className="auth-decoration decoration-two"></div>

            <div className="auth-card">

                <a href="/" className="auth-logo">
                    <span>Blog</span>Sphere
                </a>

                <div className="auth-heading">
                    <h1>Welcome back</h1>

                    <p>
                        Login to continue sharing your stories.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleLogin}
                >

                    <div className="auth-input-group">

                        <label>Email Address</label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>

                    <div className="auth-input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />

                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login to BlogSphere"}
                    </button>

                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <p className="auth-switch">
                    Don't have an account?
                    <a href="/register">
                        Create Account
                    </a>
                </p>

                <a
                    href="/"
                    className="auth-back"
                >
                    ← Back to BlogSphere
                </a>

            </div>
        </div>
    );
}

export default Login;