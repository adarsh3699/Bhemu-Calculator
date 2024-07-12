import React, { useState, useCallback } from 'react';

import './primeNoGenerator.css';

function PrimeNoGenerator() {
	const [primeNoList, setPrimeNoList] = useState([]);

	const checkPrimeNo = useCallback((number) => {
		if (!number) return;

		if (number <= 1) return false;
		else if (number === 2) return true;

		for (let i = 2; i <= Math.sqrt(number); i++) {
			if (number % i === 0) return false;
		}

		return true;
	}, []);

	const generatePrimeNo = useCallback(
		(e) => {
			e.preventDefault();
			const rangeFrom = Number(e.target.rangeFrom.value);
			const rangeTo = Number(e.target.rangeTo.value);
			if (rangeFrom > rangeTo) return;

			const primeNoList = [];
			for (let i = rangeFrom; i <= rangeTo; i++) {
				if (checkPrimeNo(i)) {
					primeNoList.push(i);
				}
			}
			console.log(primeNoList);
			setPrimeNoList(primeNoList);
		},
		[checkPrimeNo]
	);

	return (
		<div id="primeNoGenerator" onSubmit={generatePrimeNo}>
			<div className="screenTitle">Prime Number Generator</div>
			<form className="primeNoGeneratorForm">
				<input
					type="number"
					className="screenInput"
					name="rangeFrom"
					placeholder="Range From"
					autoComplete="off"
					required
					defaultValue={0}
				/>

				<div className="screenInputLable" style={{ marginBottom: '15px' }}>
					To
				</div>

				<input
					type="number"
					className="screenInput"
					name="rangeTo"
					placeholder="Range To"
					autoComplete="off"
					required
					defaultValue={10}
				/>

				<button type="submit" className="ScreenBtn">
					Generate
				</button>
			</form>
			<div className="primeNoList">
				{primeNoList.map((primeNo) => (
					<div className="primeNoItem" key={primeNo}>
						{primeNo}
					</div>
				))}
			</div>
		</div>
	);
}

export default PrimeNoGenerator;
