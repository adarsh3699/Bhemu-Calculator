import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState("system");
	const [isDark, setIsDark] = useState(false);

	// Initialize theme on mount
	useEffect(() => {
		// Check for saved theme preference or default to 'system'
		const savedTheme = localStorage.getItem("theme") || "system";
		setTheme(savedTheme);

		// Apply the theme
		applyTheme(savedTheme);
	}, []);

	// Apply theme to document
	const applyTheme = (newTheme) => {
		const root = document.documentElement;
		const body = document.body;

		// Remove existing theme classes
		root.classList.remove("light", "dark");
		body.classList.remove("light", "dark");

		let shouldBeDark = false;

		if (newTheme === "dark") {
			shouldBeDark = true;
		} else if (newTheme === "light") {
			shouldBeDark = false;
		} else {
			// System preference
			shouldBeDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		}

		// Apply appropriate class
		if (shouldBeDark) {
			root.classList.add("dark");
			body.classList.add("dark");
		} else {
			root.classList.add("light");
			body.classList.add("light");
		}

		setIsDark(shouldBeDark);
	};

	// Change theme
	const changeTheme = (newTheme) => {
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);
		applyTheme(newTheme);
	};

	// Toggle between light and dark (for existing toggle buttons)
	const toggleTheme = () => {
		const newTheme = isDark ? "light" : "dark";
		changeTheme(newTheme);
	};

	// Listen for system theme changes
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			if (theme === "system") {
				applyTheme("system");
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const value = {
		theme,
		isDark,
		changeTheme,
		toggleTheme,
		// Legacy compatibility
		isDarkMode: isDark,
		setDarkMode: (dark) => changeTheme(dark ? "dark" : "light"),
	};

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
