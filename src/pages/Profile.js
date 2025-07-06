import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import "../styles/auth.css";

function Profile() {
	const { currentUser } = useAuth();

	return (
		<div className="auth-container">
			<div className="auth-card">
				<div className="auth-header">
					<h2>Your Profile</h2>
					<p>Welcome to your account dashboard</p>
				</div>

				<div className="profile-info">
					<div className="profile-item">
						<strong>Name:</strong>
						<span>{currentUser?.displayName || "Not provided"}</span>
					</div>

					<div className="profile-item">
						<strong>Email:</strong>
						<span>{currentUser?.email}</span>
					</div>

					<div className="profile-item">
						<strong>Account Created:</strong>
						<span>{currentUser?.metadata?.creationTime}</span>
					</div>

					<div className="profile-item">
						<strong>Last Sign In:</strong>
						<span>{currentUser?.metadata?.lastSignInTime}</span>
					</div>

					<div className="profile-item">
						<strong>Email Verified:</strong>
						<span>{currentUser?.emailVerified ? "Yes" : "No"}</span>
					</div>
				</div>

				<div className="auth-links">
					<p>
						<Link to="/gpa-calculator">Go to Calculator</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Profile;
