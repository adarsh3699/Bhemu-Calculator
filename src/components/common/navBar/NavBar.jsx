import React, { useCallback, useState, useEffect, useRef } from "react";
import { useAuth } from "../../../firebase/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
	Bars3Icon,
	XMarkIcon,
	ChevronDownIcon,
	UserIcon,
	ArrowRightOnRectangleIcon,
	MoonIcon,
	SunIcon,
} from "@heroicons/react/24/outline";

// Menu configuration
const menuItems = [
	{
		name: "GPA Calculator",
		path: "gpa-calculator",
	},
	{
		name: "Other Tools",
		subItems: [
			{ name: "Speed Distance Time Calculator", path: "sdt-calculator" },
			{ name: "Matrix Determinant Calculator", path: "matrix-calculator" },
			{ name: "Number Converter", path: "number-converter" },
		],
	},
	{
		name: "About",
		path: "about",
	},
];

const flatMenuItems = [
	{ name: "GPA Calculator", path: "gpa-calculator" },
	{ name: "Speed Distance Time Calculator", path: "sdt-calculator" },
	{ name: "Matrix Determinant Calculator", path: "matrix-calculator" },
	{ name: "Number Converter", path: "number-converter" },
	{ name: "About", path: "about" },
];

const NavBar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

	const navMenuRef = useRef(null);
	const profileDropdownRef = useRef(null);

	const { currentUser, logout } = useAuth();
	const { isDark, toggleTheme } = useTheme();
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

	// Theme management is now handled by ThemeProvider

	// Mobile menu scroll lock
	useEffect(() => {
		document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
		return () => (document.body.style.overflow = "auto");
	}, [isMenuOpen]);

	// toggleTheme is now provided by useTheme hook

	const closeMenus = useCallback(() => {
		setOpenDropdownIndex(null);
		setIsMenuOpen(false);
	}, []);

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
					console.warn(`Unknown profile action: ${action}`);
					break;
			}
		},
		[navigate, handleAuth, toggleTheme]
	);

	const handleBackdropClick = useCallback((e) => {
		// Check if the clicked element is the backdrop itself (not a child)
		if (e.target === e.currentTarget) {
			setIsMenuOpen(false);
		}
	}, []);

	return (
		<>
			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[900]" onClick={handleBackdropClick} />
			)}
			<nav
				className={`fixed top-0 left-0 h-full w-80 max-w-[85%] transform transition-transform duration-300 ease-out auth-card backdrop-blur-lg z-[1000] border-r overflow-hidden shadow-2xl ${
					isMenuOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center bg-surface backdrop-blur-lg border-b border-main h-[60px] px-6 text-xl font-semibold text-main">
					<button
						onClick={() => setIsMenuOpen(false)}
						className="mr-4 p-2 rounded-lg transition-all duration-200 btn-google hover:rotate-90"
					>
						<XMarkIcon className="w-5 h-5" />
					</button>
					Menu
				</div>
				{flatMenuItems.map(({ path, name }) => (
					<NavLink
						key={path}
						to={`/${path}`}
						className={({ isActive }) =>
							`flex items-center w-full px-6 py-4 text-left transition-all duration-200 relative overflow-hidden ${
								isActive
									? "bg-indigo-500/20 text-indigo-500 font-semibold"
									: "text-main hover:bg-surface hover:text-indigo-500"
							}`
						}
						onClick={closeMenus}
					>
						{name}
					</NavLink>
				))}
			</nav>

			{/* Main NavBar */}
			<nav
				className="flex items-center justify-between backdrop-blur-lg border-b border-main shadow-sm h-[60px] w-full px-6 sticky top-0 z-[1000] transition-all duration-300"
				style={{ background: "var(--card-bg)" }}
			>
				<button
					className="lg:hidden p-2 rounded-lg transition-all duration-200 btn-google hover:rotate-90"
					onClick={() => setIsMenuOpen((prev) => !prev)}
				>
					<Bars3Icon className="w-6 h-6 text-main" />
				</button>

				<NavLink
					to="/gpa-calculator"
					className="text-2xl font-bold text-gradient select-none cursor-pointer flex items-center transition-all duration-300 hover:scale-105 hover:brightness-125"
				>
					<span className="text-xl mr-2 animate-pulse">🧮</span>
					Bhemu Calculator
				</NavLink>

				<div className="hidden lg:flex items-center gap-6 h-full" ref={navMenuRef}>
					{menuItems.map((item, index) => (
						<div key={index} className="relative h-full flex items-center">
							{item.subItems ? (
								<>
									<button
										className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden h-full ${
											item.subItems.some((subItem) => subItem.path === currentPath)
												? "text-indigo-500 font-semibold after:absolute after:bottom-2 after:left-1/2 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-indigo-400 after:to-purple-500 after:transform after:-translate-x-1/2"
												: "text-main hover:text-indigo-500 hover:-translate-y-0.5 after:absolute after:bottom-2 after:left-1/2 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-400 after:to-purple-500 after:transform after:-translate-x-1/2 after:transition-all after:duration-200 hover:after:w-4/5"
										}`}
										onClick={() => toggleDropdown(index)}
									>
										{item.name}
										<ChevronDownIcon
											className={`w-3 h-3 transition-transform duration-200 ${
												openDropdownIndex === index ? "rotate-180" : ""
											}`}
										/>
									</button>
									{openDropdownIndex === index && (
										<div className="absolute top-full left-0 mt-2 auth-card backdrop-blur-lg rounded-xl shadow-2xl z-[1000] min-w-60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
											{item.subItems.map((subItem) => (
												<NavLink
													key={subItem.path}
													to={`/${subItem.path}`}
													className={({ isActive }) =>
														`flex items-center w-full px-4 py-3.5 text-left transition-all duration-200 relative overflow-hidden text-sm ${
															isActive
																? "bg-indigo-500/20 text-indigo-500 font-semibold shadow-inset shadow-indigo-500/50"
																: "text-main hover:bg-surface hover:text-indigo-500"
														}`
													}
													onClick={closeMenus}
												>
													{subItem.name}
												</NavLink>
											))}
										</div>
									)}
								</>
							) : (
								<NavLink
									to={`/${item.path}`}
									className={({ isActive }) =>
										`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden h-full ${
											isActive
												? "text-indigo-500 font-semibold after:absolute after:bottom-2 after:left-1/2 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-indigo-400 after:to-purple-500 after:transform after:-translate-x-1/2"
												: "text-main hover:text-indigo-500 hover:-translate-y-0.5 after:absolute after:bottom-2 after:left-1/2 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-400 after:to-purple-500 after:transform after:-translate-x-1/2 after:transition-all after:duration-200 hover:after:w-4/5"
										}`
									}
								>
									{item.name}
								</NavLink>
							)}
						</div>
					))}
				</div>

				<div className="flex items-center gap-3">
					{currentUser ? (
						<div className="relative flex items-center" ref={profileDropdownRef}>
							<button
								className="w-10 h-10 rounded-full btn-primary flex items-center justify-center text-white font-semibold transition-all duration-200 border-2 border-transparent relative overflow-hidden hover:scale-110 hover:border-indigo-400"
								onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
								title="Profile Menu"
							>
								{getUserInitial()}
							</button>
							{isProfileDropdownOpen && (
								<div className="absolute top-full right-0 mt-2 auth-card backdrop-blur-lg rounded-xl shadow-2xl z-[1000] min-w-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
									<div className="px-4 py-3 border-b border-main">
										<div className="font-semibold text-main mb-1">
											{currentUser.displayName || "User"}
										</div>
										<div className="text-xs text-lighter">{currentUser.email}</div>
									</div>
									<div className="py-1">
										<button
											className="flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200 text-sm text-main hover:bg-surface hover:text-indigo-500"
											onClick={() => handleProfileAction("profile")}
										>
											<span className="flex items-center gap-2">
												<UserIcon className="w-4 h-4" />
												Profile
											</span>
										</button>
										<button
											className="flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200 text-sm text-main hover:bg-surface hover:text-indigo-500"
											onClick={() => handleProfileAction("toggle-theme")}
										>
											<span className="flex items-center gap-2">
												{isDark ? (
													<SunIcon className="w-4 h-4" />
												) : (
													<MoonIcon className="w-4 h-4" />
												)}
												{isDark ? "Light Mode" : "Dark Mode"}
											</span>
											<div
												className={`w-8 h-4 rounded-full transition-all duration-200 relative ${
													isDark ? "bg-indigo-500" : "bg-gray-300"
												}`}
											>
												<div
													className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${
														isDark ? "left-4" : "left-0.5"
													}`}
												></div>
											</div>
										</button>
										<button
											className="flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200 text-sm text-main hover:bg-surface hover:text-red-500"
											onClick={() => handleProfileAction("logout")}
										>
											<span className="flex items-center gap-2">
												<ArrowRightOnRectangleIcon className="w-4 h-4" />
												Logout
											</span>
										</button>
									</div>
								</div>
							)}
						</div>
					) : (
						<button
							className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden"
							onClick={handleAuth}
						>
							Login
						</button>
					)}
				</div>
			</nav>
		</>
	);
};

export default NavBar;
