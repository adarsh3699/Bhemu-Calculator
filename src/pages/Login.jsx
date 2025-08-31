import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { GoogleIcon } from "../assets/icons";
import "../styles/auth.css";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login, signInWithGoogle, currentUser } = useAuth();
	const navigate = useNavigate();

	// Redirect if already logged in
	useEffect(() => {
		if (currentUser) {
			navigate("/gpa-calculator", { replace: true });
		}
	}, [currentUser, navigate]);

	async function handleSubmit(e) {
		e.preventDefault();

		if (!email || !password) {
			return setError("Please fill in all fields");
		}

		try {
			setError("");
			setLoading(true);
			await login(email, password);
			navigate("/gpa-calculator");
		} catch (error) {
			setError("Failed to log in: " + error.message);
		}
		setLoading(false);
	}

	async function handleGoogleSignIn() {
		try {
			setError("");
			setLoading(true);
			await signInWithGoogle();
			navigate("/gpa-calculator");
		} catch (error) {
			setError("Failed to sign in with Google: " + error.message);
		}
		setLoading(false);
	}

	return (
		<div className="auth-container">
			<div className="auth-card">
				<div className="auth-header">
					<h2>Welcome Back</h2>
					<p>Sign in to your account</p>
				</div>

				{error && <div className="auth-error">{error}</div>}

				<form onSubmit={handleSubmit} className="auth-form">
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
						/>
					</div>

					<button type="submit" className="auth-btn primary" disabled={loading}>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<div className="auth-divider">
					<span>or</span>
				</div>

				<button onClick={handleGoogleSignIn} className="auth-btn google" disabled={loading}>
					<GoogleIcon />
					Continue with Google
				</button>

				<div className="auth-links">
					<Link to="/forgot-password">Forgot Password?</Link>
					<p>
						Don't have an account? <Link to="/signup">Sign up</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Login;
