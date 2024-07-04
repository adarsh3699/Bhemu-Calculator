import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import NavBar from './components/navBar/NavBar';
import MenuBar from './components/menuBar/MenuBar';

import Calculator from './components/screen/calculator/Calculator';
import STDcalc from './components/screen/stdCalc/STDcalc';

import './styles/App.css';

const menuItems = [
	{
		name: 'Calculator',
		menuName: 'calculator',
		screen: Calculator,
	},
	{
		name: 'STD Calculator',
		menuName: 'std-calculator',
		screen: STDcalc,
	},
	{
		name: 'Matrix determinant calculator',
		menuName: 'matrix-determinant-calculator',
		screen: STDcalc,
	},
	{
		name: 'Number Patterns Generator',
		menuName: 'number-patterns-generator',
		screen: STDcalc,
	},
	{
		name: 'Prime Number checker',
		menuName: 'prime-number-checker',
		screen: STDcalc,
	},
	{
		name: 'Binary No. to decimal No',
		menuName: 'binary-no-to-decimal-no',
		screen: STDcalc,
	},
];

function App() {
	const [isDarkMode, setDarkMode] = useState(true);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const menuName = location.pathname.split('/')[1] || 'calculator';

	return (
		<div className={'background ' + (isDarkMode ? 'dark' : 'light')}>
			<NavBar setDarkMode={setDarkMode} setIsMenuOpen={setIsMenuOpen} />
			<div className="pageContains">
				<MenuBar
					menuItems={menuItems}
					navigate={navigate}
					menuName={menuName}
					isMenuOpen={isMenuOpen}
					setIsMenuOpen={setIsMenuOpen}
				/>

				{menuItems.map((item, index) => (
					<React.Fragment key={index}>{item.menuName === menuName && <item.screen />}</React.Fragment>
				))}
			</div>
		</div>
	);
}

export default App;
