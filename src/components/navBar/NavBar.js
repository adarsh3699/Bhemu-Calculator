import React, { useCallback } from 'react';

import './navBar.css';

const NavBar = ({ setDarkMode, setIsMenuOpen }) => {
	const toggleTheme = useCallback(() => {
		setDarkMode((prev) => !prev);
	}, [setDarkMode]);
	return (
		<div className="navBar">
			<div className={`menuToggle`} onClick={() => setIsMenuOpen((prev) => !prev)}>
				☰
			</div>
			<div className="navTitle">Bhemu Calculator</div>
			<div className="toggleBtn" onClick={toggleTheme}></div>
		</div>
	);
};

export default NavBar;
