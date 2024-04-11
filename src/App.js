import React, { useCallback, useState } from 'react';
import Calculator from './components/calculator/Calculator';
import './styles/App.css';

function App() {
	const [theme, setTheme] = useState('dark');
	const toggleTheme = useCallback(() => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	}, [theme]);

	return (
		<div className={'background ' + theme}>
			<div className="toggleBtn" onClick={toggleTheme}></div>

			<Calculator />
		</div>
	);
}

export default App;
