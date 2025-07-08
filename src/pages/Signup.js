import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { GoogleIcon } from "../assets/icons";
import "../styles/auth.css";

function Signup() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { signup, signInWithGoogle } = useAuth();
	const navigate = useNavigate();

	async function handleSubmit(e) {
		e.preventDefault();

		if (!name || !email || !password || !confirmPassword) {
			return setError("Please fill in all fields");
		}

		if (password !== confirmPassword) {
			return setError("Passwords do not match");
		}

		if (password.length < 6) {
			return setError("Password should be at least 6 characters");
		}

		try {
			setError("");
			setLoading(true);
			await signup(email, password, name);
			navigate("/gpa-calculator");
		} catch (error) {
			setError("Failed to create account: " + error.message);
		}
		setLoading(false);
	}

	async function handleGoogleSignUp() {
		try {
			setError("");
			setLoading(true);
			await signInWithGoogle();
			navigate("/gpa-calculator");
		} catch (error) {
			setError("Failed to sign up with Google: " + error.message);
		}
		setLoading(false);
	}

	return (
		<div className="auth-container">
			<div className="auth-card">
				<div className="auth-header">
					<h2>Create Account</h2>
					<p>Sign up to get started</p>
				</div>

				{error && <div className="auth-error">{error}</div>}

				<form onSubmit={handleSubmit} className="auth-form">
					<div className="form-group">
						<label htmlFor="name">Full Name</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your full name"
							required
						/>
					</div>

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
							placeholder="Create a password (min 6 characters)"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="confirmPassword">Confirm Password</label>
						<input
							type="password"
							id="confirmPassword"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm your password"
							required
						/>
					</div>

					<button type="submit" className="auth-btn primary" disabled={loading}>
						{loading ? "Creating Account..." : "Create Account"}
					</button>
				</form>

				<div className="auth-divider">
					<span>or</span>
				</div>

				<button onClick={handleGoogleSignUp} className="auth-btn google" disabled={loading}>
					<GoogleIcon />
					Continue with Google
				</button>

				<div className="auth-links">
					<p>
						Already have an account? <Link to="/login">Sign in</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Signup;
