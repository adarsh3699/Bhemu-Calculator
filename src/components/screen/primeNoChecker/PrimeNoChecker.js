import React, { useCallback, useState } from 'react';

import './primeNoChecker.css';

function PrimeNoChecker() {
	const [msg, setMsg] = useState({});

	const checkPrimeNo = useCallback((e) => {
		e.preventDefault();
		const userNo = Number(e.target.userNo.value);
		if (!userNo) return;

		if (userNo <= 1) {
			e.target.reset();
			return setMsg({ text: `"${userNo}" is Not a Prime number`, isPrime: false });
		} else if (userNo === 2) {
			e.target.reset();
			return setMsg({ text: `"${userNo}" is a Prime number`, isPrime: true });
		}

		for (let i = 2; i <= Math.sqrt(userNo); i++) {
			if (userNo % i === 0) {
				e.target.reset();
				return setMsg({ text: `"${userNo}" is Not a Prime number`, isPrime: false });
			}
		}

		setMsg({ text: `"${userNo}" is a Prime number`, isPrime: true });
		e.target.reset();
	}, []);

	return (
		<div id="primeNoChecker">
			<div className="screenTitle">Prime Number Checker</div>
			<form onSubmit={checkPrimeNo} className="primeNoCheckerForm">
				<input
					type="number"
					className="screenInput"
					name="userNo"
					placeholder="Enter a number"
					autoComplete="off"
					onChange={() => msg && setMsg('')}
				/>
				<br />
				<button type="submit" className="ScreenBtn">
					Check
				</button>
				<div className={msg.isPrime ? 'primeNoTrue primeNoCheckerMsg' : 'primeNoFalse primeNoCheckerMsg'}>
					{msg.text}
				</div>
			</form>
		</div>
	);
}

export default PrimeNoChecker;
