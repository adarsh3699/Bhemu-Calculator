import React, { useState } from 'react';
import MenuBar from './components/menuBar/MenuBar';
import NavBar from './components/navBar/NavBar';
import Calculator from './components/calculator/Calculator';

import './styles/App.css';

function App() {
	const [isDarkMode, setDarkMode] = useState(true);

	return (
		<div className={'background ' + (isDarkMode ? 'dark' : 'light')}>
			<NavBar setDarkMode={setDarkMode} />
			<div className="pageContains">
				<MenuBar />
				<Calculator />
			</div>
		</div>
	);
}

export default App;
