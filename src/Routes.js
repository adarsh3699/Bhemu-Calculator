import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavBar, MessageProvider } from "./components/common";
import PrivateRoute from "./components/PrivateRoute";

// Lazy load pages for better performance
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import GpaCalculator from "./pages/GpaCalculator";
import SpeedDistanceTimeCalculator from "./pages/SpeedDistanceTimeCalculator";
import MatrixDeterminantCalculator from "./pages/MatrixDeterminantCalculator";
import NumberConverter from "./pages/NumberConverter";
import About from "./pages/About";

import "./styles/App.css";

function AppRoutes() {
	return (
		<MessageProvider>
			<div className="background">
				<NavBar />
				<main className="pageContains">
					<Routes>
						{/* Auth Routes */}
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route
							path="/profile"
							element={
								<PrivateRoute>
									<Profile />
								</PrivateRoute>
							}
						/>

						{/* Calculator Routes */}
						<Route path="/gpa-calculator" element={<GpaCalculator />} />
						<Route path="/sdt-calculator" element={<SpeedDistanceTimeCalculator />} />
						<Route path="/matrix-calculator" element={<MatrixDeterminantCalculator />} />
						<Route path="/number-converter" element={<NumberConverter />} />
						<Route path="/about" element={<About />} />

						{/* Default Routes */}
						<Route path="/" element={<Navigate to="/gpa-calculator" replace />} />
						<Route path="*" element={<Navigate to="/gpa-calculator" replace />} />
					</Routes>
				</main>
			</div>
		</MessageProvider>
	);
}

export default AppRoutes;
