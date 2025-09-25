import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { resetPassword, currentUser } = useAuth();
	const navigate = useNavigate();

	// Redirect if already logged in
	useEffect(() => {
		if (currentUser) {
			navigate("/gpa-calculator", { replace: true });
		}
	}, [currentUser, navigate]);

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
		<div className="min-h-[calc(100vh-45px)] flex items-center justify-center p-4 bg-transparent">
			<div className="auth-card rounded-3xl p-10 w-full max-w-md box-border">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-2 text-gradient">Reset Password</h2>
					<p className="text-subtle text-sm m-0">Enter your email to reset your password</p>
				</div>

				{error && <div className="bg-error text-error px-4 py-2.5 rounded-xl mb-6 text-sm border">{error}</div>}
				{message && (
					<div className="bg-success text-success px-4 py-2.5 rounded-xl mb-6 text-sm border">{message}</div>
				)}

				<form onSubmit={handleSubmit} className="mb-5">
					<div className="mb-5">
						<label htmlFor="email" className="block mb-2 font-medium text-light text-sm">
							Email
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email address"
							required
							className="w-full px-4 py-2.5 border-2 border-main rounded-xl text-base transition-all duration-200 bg-surface text-main box-border focus-primary placeholder:text-subtle"
						/>
					</div>

					<button
						type="submit"
						className="btn-primary w-full px-4 py-2.5 rounded-xl text-base font-semibold border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 mb-4 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
						disabled={loading}
					>
						{loading ? "Sending..." : "Reset Password"}
					</button>
				</form>

				<div className="text-center">
					<Link
						to="/login"
						className="text-primary no-underline font-medium transition-colors duration-200 hover:text-primary-bright hover:underline"
					>
						Back to Login
					</Link>
					<p className="mt-2 mb-0 text-subtle text-sm">
						Don't have an account?{" "}
						<Link
							to="/signup"
							className="text-primary no-underline font-medium transition-colors duration-200 hover:text-primary-bright hover:underline"
						>
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
