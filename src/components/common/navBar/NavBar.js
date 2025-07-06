import React, { useCallback, useState, useEffect, useRef } from "react";
import { useAuth } from "../../../firebase/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./navBar.css";

// Menu configuration
const menuItems = [
	{ name: "GPA Calculator", path: "gpa-calculator" },
	{
		name: "Other Tools",
		subItems: [
			{ name: "Speed Distance Time Calculator", path: "sdt-calculator" },
			{ name: "Matrix Determinant Calculator", path: "matrix-calculator" },
			{ name: "Number Converter", path: "number-converter" },
		],
	},
	{ name: "About", path: "about" },
];

const flatMenuItems = [
	{ name: "GPA Calculator", path: "gpa-calculator" },
	{ name: "Speed Distance Time Calculator", path: "sdt-calculator" },
	{ name: "Matrix Determinant Calculator", path: "matrix-calculator" },
	{ name: "Number Converter", path: "number-converter" },
	{ name: "About", path: "about" },
];

const NavBar = () => {
	const [isDarkMode, setDarkMode] = useState(true);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

	const navMenuRef = useRef(null);
	const profileDropdownRef = useRef(null);

	const { currentUser, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const currentPath = location.pathname.split("/")[1] || "gpa-calculator";

	// Handle clicks outside dropdowns
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
				setOpenDropdownIndex(null);
			}
			if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
				setIsProfileDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Theme management
	useEffect(() => {
		document.documentElement.classList.toggle("light", !isDarkMode);
		document.body.classList.toggle("light", !isDarkMode);
	}, [isDarkMode]);

	// Mobile menu scroll lock
	useEffect(() => {
		document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
		return () => (document.body.style.overflow = "auto");
	}, [isMenuOpen]);

	const toggleTheme = useCallback(() => setDarkMode((prev) => !prev), []);

	const navigateToPath = useCallback(
		(path) => {
			navigate(`/${path}`);
			setOpenDropdownIndex(null);
			setIsMenuOpen(false);
		},
		[navigate]
	);

	const toggleDropdown = useCallback((index) => {
		setOpenDropdownIndex((prev) => (prev === index ? null : index));
	}, []);

	const handleAuth = useCallback(async () => {
		try {
			if (currentUser) {
				await logout();
				navigate("/login");
			} else {
				navigate("/login");
			}
		} catch (error) {
			console.error("Authentication error:", error);
		}
	}, [currentUser, logout, navigate]);

	const getUserInitial = useCallback(() => {
		if (!currentUser) return "U";
		const name = currentUser.displayName || currentUser.email;
		return name ? name.charAt(0).toUpperCase() : "U";
	}, [currentUser]);

	const handleProfileAction = useCallback(
		(action) => {
			setIsProfileDropdownOpen(false);
			switch (action) {
				case "profile":
					navigate("/profile");
					break;
				case "logout":
					handleAuth();
					break;
				case "toggle-theme":
					toggleTheme();
					break;
				default:
					// Handle unknown actions gracefully
					console.warn(`Unknown profile action: ${action}`);
					break;
			}
		},
		[navigate, handleAuth, toggleTheme]
	);

	const handleBackdropClick = useCallback((e) => {
		if (e.target.classList.contains("backdrop")) {
			setIsMenuOpen(false);
		}
	}, []);

	return (
		<>
			{/* Mobile Menu */}
			<div className={`backdrop ${isMenuOpen ? "open" : ""}`} onClick={handleBackdropClick} />
			<div className={`menuBar ${isMenuOpen ? "open" : ""}`}>
				<div className="menuToggleBar">
					<span onClick={() => setIsMenuOpen(false)}>☰</span> Menu
				</div>
				{flatMenuItems.map(({ path, name }) => (
					<div
						key={path}
						className={`menuBtn ${currentPath === path ? "activeMenu" : ""}`}
						onClick={() => navigateToPath(path)}
					>
						{name}
					</div>
				))}
			</div>

			{/* Main NavBar */}
			<div className="navBar">
				<div className="menuToggle" onClick={() => setIsMenuOpen((prev) => !prev)}>
					☰
				</div>
				<div className="navTitle">Bhemu Calculator</div>

				<div className="navMenu" ref={navMenuRef}>
					{menuItems.map((item, index) => (
						<div key={index} className="navMenuItem">
							{item.subItems ? (
								<div className="dropdown">
									<button
										className={`navMenuBtn ${
											item.subItems.some((subItem) => subItem.path === currentPath)
												? "active"
												: ""
										}`}
										onClick={() => toggleDropdown(index)}
									>
										{item.name}
										<span className={`dropdown-arrow ${openDropdownIndex === index ? "open" : ""}`}>
											▼
										</span>
									</button>
									{openDropdownIndex === index && (
										<div className="dropdownContent">
											{item.subItems.map((subItem) => (
												<button
													key={subItem.path}
													className={`dropdownItem ${
														subItem.path === currentPath ? "active" : ""
													}`}
													onClick={() => navigateToPath(subItem.path)}
												>
													{subItem.name}
												</button>
											))}
										</div>
									)}
								</div>
							) : (
								<button
									className={`navMenuBtn ${item.path === currentPath ? "active" : ""}`}
									onClick={() => navigateToPath(item.path)}
								>
									{item.name}
								</button>
							)}
						</div>
					))}
				</div>

				<div className="navAuth">
					{currentUser ? (
						<div className="profileSection" ref={profileDropdownRef}>
							<div
								className="profileIcon"
								onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
								title="Profile Menu"
							>
								{getUserInitial()}
							</div>
							{isProfileDropdownOpen && (
								<div className="profileDropdown">
									<div className="profileHeader">
										<div className="profileInfo">
											<div className="profileName">{currentUser.displayName || "User"}</div>
											<div className="profileEmail">{currentUser.email}</div>
										</div>
									</div>
									<div className="profileActions">
										<button
											className="profileAction"
											onClick={() => handleProfileAction("profile")}
										>
											Profile
										</button>
										<button
											className="profileAction themeToggle"
											onClick={() => handleProfileAction("toggle-theme")}
										>
											<span>Dark Mode</span>
											<div className={`toggleSwitch ${isDarkMode ? "on" : "off"}`}>
												<div className="toggleSlider"></div>
											</div>
										</button>
										<button
											className="profileAction logout"
											onClick={() => handleProfileAction("logout")}
										>
											Logout
										</button>
									</div>
								</div>
							)}
						</div>
					) : (
						<button className="authBtn loginBtn" onClick={handleAuth}>
							Login
						</button>
					)}
				</div>
			</div>
		</>
	);
};

export default NavBar;
