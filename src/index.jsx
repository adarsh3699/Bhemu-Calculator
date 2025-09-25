import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Modal from "react-modal";
import AppRoutes from "./Routes";
import { AuthProvider } from "./firebase/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import "./styles/index.css";

// Set the app element for react-modal accessibility
Modal.setAppElement("#root");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
			<ThemeProvider>
				<AuthProvider>
					<AppRoutes />
				</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	</React.StrictMode>
);
