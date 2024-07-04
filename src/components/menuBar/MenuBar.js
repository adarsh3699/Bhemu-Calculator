import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import './menuBar.css';

function MenuBar({ menuItems, navigate, menuName, isMenuOpen, setIsMenuOpen }) {
	const handleMenuChange = useCallback(
		(item) => {
			setIsMenuOpen(false); // Close menu on item click

			if (menuName !== item?.menuName) navigate(item?.menuName);
		},
		[menuName, setIsMenuOpen, navigate]
	);

	const handleCloseMenu = (e) => {
		if (e.target.className.includes('backdrop')) {
			setIsMenuOpen(false);
		}
	};

	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
	}, [isMenuOpen]);

	return (
		<>
			<div className={`backdrop ${isMenuOpen ? 'open' : ''}`} onClick={handleCloseMenu}></div>
			<div className={`menuBar ${isMenuOpen ? 'open' : ''}`}>
				<div className="menuToggleBar">
					<span onClick={() => setIsMenuOpen(false)}>☰</span> Menu
				</div>

				{menuItems.map(({ menuName: itemMenuName, name }, index) => (
					<div
						key={index}
						className={`menuBtn ${menuName === itemMenuName ? 'activeMenu' : ''}`}
						onClick={() => handleMenuChange({ menuName: itemMenuName, name })}
					>
						{name}
					</div>
				))}
			</div>
		</>
	);
}

MenuBar.propTypes = {
	menuItems: PropTypes.arrayOf(
		PropTypes.shape({
			menuName: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		})
	).isRequired,
	navigate: PropTypes.func.isRequired,
	menuName: PropTypes.string.isRequired,
};

export default MenuBar;
