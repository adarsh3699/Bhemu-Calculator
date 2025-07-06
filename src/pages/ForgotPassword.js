import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import "../styles/auth.css";

function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { resetPassword } = useAuth();

	async function handleSubmit(e) {
		e.preventDefault();

		if (!email) {
			return setError("Please enter your email address");
		}

		try {
			setMessage("");
			setError("");
			setLoading(true);
			await resetPassword(email);
			setMessage("Check your inbox for further instructions");
		} catch (error) {
			setError("Failed to reset password: " + error.message);
		}
		setLoading(false);
	}

	return (
		<div className="auth-container">
			<div className="auth-card">
				<div className="auth-header">
					<h2>Reset Password</h2>
					<p>Enter your email to reset your password</p>
				</div>

				{error && <div className="auth-error">{error}</div>}
				{message && <div className="auth-success">{message}</div>}

				<form onSubmit={handleSubmit} className="auth-form">
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email address"
							required
						/>
					</div>

					<button type="submit" className="auth-btn primary" disabled={loading}>
						{loading ? "Sending..." : "Reset Password"}
					</button>
				</form>

				<div className="auth-links">
					<Link to="/login">Back to Login</Link>
					<p>
						Don't have an account? <Link to="/signup">Sign up</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
