import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import './menuBar.css';

const menuItems = [
	{
		name: 'Calculator',
		folderName: 'calculator',
	},
	{
		name: 'STD Calculator',
		folderName: 'std-calculator',
	},
	{
		name: 'Matrix determinant calculator',
		folderName: 'matrix-determinant-calculator',
	},
	{
		name: 'Number Patterns Generator',
		folderName: 'number-patterns-generator',
	},
	{
		name: 'Prime Number checker',
		folderName: 'prime-number-checker',
	},
	{
		name: 'Binary No. to decimal No',
		folderName: 'binary-no-to-decimal-no',
	},
];

function MenuBar() {
	const [searchParams, setSearchParams] = useSearchParams();
	// const navigate = useNavigate();
	const folderName = searchParams.get('folder');

	const handleMenuChange = useCallback(
		(item) => {
			if (folderName === item?.folderName) return;

			setSearchParams({ folder: item?.folderName });
		},
		[folderName, setSearchParams]
	);
	return (
		<div className="menuBar">
			{menuItems.map((item, index) => (
				<div
					key={index}
					className={`menuBtn ${folderName === item.folderName ? 'activeMenu' : ''}`}
					onClick={() => handleMenuChange(item)}
				>
					{item.name}
				</div>
			))}
		</div>
	);
}

export default MenuBar;
