import React, { useCallback } from 'react';

import './navBar.css';

const NavBar = ({ setDarkMode }) => {
	const toggleTheme = useCallback(() => {
		setDarkMode((prev) => !prev);
	}, [setDarkMode]);
	return (
		<div className="navBar">
			<div className="navTitle">Bhemu Calculator</div>
			<div className="toggleBtn" onClick={toggleTheme}></div>
		</div>
	);
};

export default NavBar;
