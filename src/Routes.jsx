import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NavBar, MessageProvider } from "./components/common";
import PrivateRoute from "./components/PrivateRoute";

// Lazy load pages for better performance
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const Profile = React.lazy(() => import("./pages/Profile"));
const GpaCalculator = React.lazy(() => import("./pages/GpaCalculator"));
const SpeedDistanceTimeCalculator = React.lazy(() => import("./pages/SpeedDistanceTimeCalculator"));
const MatrixDeterminantCalculator = React.lazy(() => import("./pages/MatrixDeterminantCalculator"));
const NumberConverter = React.lazy(() => import("./pages/NumberConverter"));
const About = React.lazy(() => import("./pages/About"));

// Loading component for better UX
const LoadingFallback = () => (
	<div className="min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
			<p className="text-gray-600 dark:text-gray-400 text-sm">Loading page...</p>
		</div>
	</div>
);

function AppRoutes() {
	return (
		<MessageProvider>
			<NavBar />
			<main>
				<Suspense fallback={<LoadingFallback />}>
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
				</Suspense>
			</main>
		</MessageProvider>
	);
}

export default AppRoutes;
