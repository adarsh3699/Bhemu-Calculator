import React, { useCallback, useState } from 'react';
import './calculator.css';

function Calculator() {
	const [value, setValue] = useState('');

	const handleBrnClick = useCallback(
		(e) => {
			setValue(value + e.target.innerHTML);
		},
		[value]
	);

	const handleInputChange = useCallback((e) => {
		if (!isNaN(Number(e.nativeEvent.data)) || ['+', '-', '*', '/', '.'].includes(e.nativeEvent.data)) {
			setValue(e.target.value);
		}
	}, []);

	const handleEqualToBtn = useCallback(() => {
		try {
			// eslint-disable-next-line no-eval
			const result = eval(value);
			console.log(value);
			if (String(result).split('.')[1]?.length > 12) {
				setValue(result.toFixed(3).replace(/\.?0*$/, ''));
			} else {
				setValue(result);
			}
		} catch (error) {
			console.log(error);
		}
	}, [value]);

	const handleClearBtn = useCallback(() => {
		setValue('');
	}, []);
	return (
		<div className="calculatorBg">
			<div className="calculator">
				<div className="buttons">
					<input type="text" id="value" value={value} onChange={handleInputChange} />
					<span onClick={handleClearBtn} id="clear">
						Clear
					</span>
					<span onClick={handleBrnClick}>/</span>
					<span onClick={handleBrnClick}>*</span>
					<span onClick={handleBrnClick}>7</span>
					<span onClick={handleBrnClick}>8</span>
					<span onClick={handleBrnClick}>9</span>
					<span onClick={handleBrnClick}>-</span>
					<span onClick={handleBrnClick}>4</span>
					<span onClick={handleBrnClick}>5</span>
					<span onClick={handleBrnClick}>6</span>
					<span onClick={handleBrnClick} id="plus">
						+
					</span>
					<span onClick={handleBrnClick}>1</span>
					<span onClick={handleBrnClick}>2</span>
					<span onClick={handleBrnClick}>3</span>
					<span onClick={handleBrnClick}>0</span>
					<span onClick={handleBrnClick}>00</span>
					<span onClick={handleBrnClick}>.</span>
					<span onClick={handleEqualToBtn} id="equal">
						=
					</span>
				</div>
			</div>
		</div>
	);
}

export default Calculator;
