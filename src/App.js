import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
		// screen: MatrixDeterminantCalculator,
	},
	{
		name: 'Number Patterns Generator',
		menuName: 'number-patterns-generator',
	},
	{
		name: 'Prime Number checker',
		menuName: 'prime-number-checker',
	},
	{
		name: 'Binary No. to decimal No',
		menuName: 'binary-no-to-decimal-no',
	},
];

function App() {
	const [isDarkMode, setDarkMode] = useState(true);
	const [searchParams, setSearchParams] = useSearchParams();

	const menuName = searchParams.get('menu') || 'calculator';

	return (
		<div className={'background ' + (isDarkMode ? 'dark' : 'light')}>
			<NavBar setDarkMode={setDarkMode} />
			<div className="pageContains">
				<MenuBar menuItems={menuItems} setSearchParams={setSearchParams} menuName={menuName} />

				{menuItems.map((item, index) => (
					<React.Fragment key={index}>{item.menuName === menuName && <item.screen />}</React.Fragment>
				))}
			</div>
		</div>
	);
}

export default App;
