import React, { useCallback } from 'react';

import './primeNoChecker.css';

function PrimeNoChecker() {
	const checkPrimeNo = useCallback((e) => {
		e.preventDefault();
		const userNo = Number(e.target.userNo.value);
		if (!userNo) return;

		if (userNo === 1) return console.log('Not a prime number');
		if (userNo === 2) return console.log('Prime number');

		for (let i = 2; i <= Math.sqrt(userNo); i++) {
			if (userNo % i === 0) return console.log('Not a prime number');
		}
		console.log('Prime number');
	}, []);

	return (
		<div id="primeNoChecker">
			<div className="screenTitle">Prime Number Checker</div>
			<form onSubmit={checkPrimeNo} className="primeNoCheckerForm">
				<input type="text" className="screenInput" name="userNo" placeholder="Enter a number" /> <br />
				<button type="submit" className="ScreenBtn">
					Check
				</button>
			</form>
		</div>
	);
}

export default PrimeNoChecker;
