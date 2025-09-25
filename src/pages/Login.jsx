import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { GoogleIcon } from "../assets/icons";

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
		<div className="min-h-[calc(100vh-45px)] flex items-center justify-center p-4 bg-transparent">
			<div className="auth-card rounded-3xl p-10 w-full max-w-md box-border">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-2 text-gradient">Welcome Back</h2>
					<p className="text-subtle text-sm m-0">Sign in to your account</p>
				</div>

				{error && <div className="bg-error text-error px-4 py-2.5 rounded-xl mb-6 text-sm border">{error}</div>}

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
							placeholder="Enter your email"
							required
							className="w-full px-4 py-2.5 border-2 border-main rounded-xl text-base transition-all duration-200 bg-surface text-main box-border focus-primary placeholder:text-subtle"
						/>
					</div>

					<div className="mb-5">
						<label htmlFor="password" className="block mb-2 font-medium text-light text-sm">
							Password
						</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							className="w-full px-4 py-2.5 border-2 border-main rounded-xl text-base transition-all duration-200 bg-surface text-main box-border focus-primary placeholder:text-subtle"
						/>
					</div>

					<button
						type="submit"
						className="btn-primary w-full px-4 py-2.5 rounded-xl text-base font-semibold border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 mb-4 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
						disabled={loading}
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<div className="relative text-center my-6">
					<div className="absolute top-1/2 left-0 right-0 h-px bg-border-subtle -z-10"></div>
					<span className="bg-[var(--card-bg)] px-4 text-subtle text-sm">or</span>
				</div>

				<button
					onClick={handleGoogleSignIn}
					className="btn-google w-full px-4 py-2.5 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 mb-4 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
					disabled={loading}
				>
					<GoogleIcon />
					Continue with Google
				</button>

				<div className="text-center">
					<Link
						to="/forgot-password"
						className="text-primary no-underline font-medium transition-colors duration-200 hover:text-primary-bright hover:underline"
					>
						Forgot Password?
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

export default Login;
