import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

const PrivateRoute = ({ children }) => {
	const { currentUser, loading } = useAuth();
	const location = useLocation();

	// Show loading state while authentication is being checked
	if (loading) {
		return (
			<div className="loading-container">
				<div className="loading-spinner">
					<div className="spinner"></div>
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	// Redirect to login if not authenticated, preserving the intended destination
	if (!currentUser) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
};

export default PrivateRoute;
