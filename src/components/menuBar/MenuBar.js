import React, { useCallback } from 'react';
import './menuBar.css';

function MenuBar({ menuItems, setSearchParams, menuName }) {
	const handleMenuChange = useCallback(
		(item) => {
			if (menuName === item?.menuName) return;

			setSearchParams({ menu: item?.menuName });
		},
		[menuName, setSearchParams]
	);
	return (
		<div className="menuBar">
			{menuItems.map((item, index) => (
				<div
					key={index}
					className={`menuBtn ${menuName === item.menuName ? 'activeMenu' : ''}`}
					onClick={() => handleMenuChange(item)}
				>
					{item.name}
				</div>
			))}
		</div>
	);
}

export default MenuBar;
