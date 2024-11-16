import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import NavBar from './components/navBar/NavBar';
import MenuBar from './components/menuBar/MenuBar';
import ShowMsg from './components/showMsg/ShowMsg';

import Calculator from './components/screen/calculator/Calculator';
import STDcalc from './components/screen/stdCalc/STDcalc';
import MatrixCalc from './components/screen/matrixCalc/MatrixCalc';
import PrimeNoChecker from './components/screen/primeNoChecker/PrimeNoChecker';
import PrimeNoGenerator from './components/screen/primeNoGenerator/PrimeNoGenerator';
import NumberConverter from './components/screen/numberConverter/NumberConverter';
import GPA_Calc from './components/screen/gpaCalc/GPA_Calc';
import AboutDeveloper from './components/screen/aboutDeveloper/AboutDeveloper';

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
		screen: MatrixCalc,
	},
	{
		name: 'Number Converter',
		menuName: 'number-converter',
		screen: NumberConverter,
	},
	{
		name: 'GPA Calculator',
		menuName: 'gpa-calculator',
		screen: GPA_Calc,
	},
	{
		name: 'Prime Number Generator',
		menuName: 'number-patterns-generator',
		screen: PrimeNoGenerator,
	},
	{
		name: 'Prime Number checker',
		menuName: 'prime-number-checker',
		screen: PrimeNoChecker,
	},
	{ name: 'About Devloper', menuName: 'about-devloper', screen: AboutDeveloper },
];

function App() {
	const [msg, setMsg] = useState({ text: '', type: '' });
	const [isDarkMode, setDarkMode] = useState(true);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const menuName = location.pathname.split('/')[1] || 'calculator';

	const handleMsgShown = useCallback((msgText, type) => {
		if (msgText) {
			setMsg({ text: msgText, type: type });
			setTimeout(() => {
				setMsg({ text: '', type: '' });
			}, 3000);
		} else {
			console.log('Please Provide Text Msg');
		}
	}, []);

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
					<React.Fragment key={index}>
						{item.menuName === menuName && <item.screen handleMsgShown={handleMsgShown} />}
					</React.Fragment>
				))}
			</div>
			{msg && <ShowMsg msgText={msg?.text} type={msg?.type} />}
		</div>
	);
}

export default App;
