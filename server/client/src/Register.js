import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                `${API_URL}/api/auth/register`,
                {
                    name,
                    email,
                    password,
                }
            );

            alert("Registration successful! Please login.");

            window.location.href = "/login";

        } catch (error) {
            console.error("REGISTER ERROR:", error);

            alert(
                error.response?.data?.message ||
                    "Registration failed. Please try again."
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
                    <h1>Create your account</h1>

                    <p>
                        Join BlogSphere and start sharing your ideas.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleRegister}
                >

                    <div className="auth-input-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />
                    </div>

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
                            placeholder="Create a password"
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
                            ? "Creating account..."
                            : "Create Account"}
                    </button>

                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <p className="auth-switch">
                    Already have an account?

                    <a href="/login">
                        Login
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

export default Register;