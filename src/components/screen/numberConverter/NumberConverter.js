import React, { useState, useCallback } from 'react';
import './numberConverter.css';

const NumberConverter = ({ handleMsgShown }) => {
	const [fromType, setFromType] = useState('decimal');
	const [toType, setToType] = useState('binary');
	const [inputValue, setInputValue] = useState('');
	const [result, setResult] = useState('');

	const convertNumber = useCallback(() => {
		if (!inputValue) return handleMsgShown('Please Enter a Number', 'warning');

		let decimal;

		// Function to handle fractional conversion for binary, octal, and hexadecimal into decimals
		const convertToDecimal = (numStr, base) => {
			if (numStr.includes('.')) {
				const [wholePart, fractionalPart] = numStr.split('.');

				let wholeDecimal = parseInt(wholePart || 0, base);

				// Convert fractional part
				let fractionalDecimal = 0;
				for (let i = 0; i < fractionalPart.length; i++) {
					fractionalDecimal += parseInt(fractionalPart[i], base) * Math.pow(base, -(i + 1));
				}
				return wholeDecimal + fractionalDecimal;
			} else {
				return parseInt(numStr, base);
			}
		};

		switch (fromType) {
			case 'binary':
				decimal = convertToDecimal(inputValue, 2);
				break;
			case 'octal':
				decimal = convertToDecimal(inputValue, 8);
				break;
			case 'hexadecimal':
				decimal = convertToDecimal(inputValue, 16);
				break;
			default:
				decimal = parseFloat(inputValue, 10); // Decimal input doesn't require special handling
		}

		if (isNaN(decimal)) {
			setResult('Invalid input');
			return;
		}

		switch (toType) {
			case 'binary':
				setResult(decimal.toString(2));
				break;
			case 'octal':
				setResult(decimal.toString(8));
				break;
			case 'hexadecimal':
				setResult(decimal.toString(16).toUpperCase());
				break;
			default:
				setResult(decimal.toString(10));
		}
	}, [fromType, toType, inputValue, handleMsgShown]);

	const reset = useCallback(() => {
		setInputValue('');
		setResult('');
	}, []);

	const swap = useCallback(() => {
		setFromType(toType);
		setToType(fromType);
		const temp = inputValue;
		setInputValue(result);
		setResult(temp);
	}, [fromType, toType, inputValue, result]);

	return (
		<div id="numberConverter">
			<div className="screenTitle">Number Converter</div>

			<div className="type-selector-box">
				<div>
					<label htmlFor="convertFrom">From</label>
					<select id="convertFrom" value={fromType} onChange={(e) => setFromType(e.target.value)}>
						<option value="decimal">Decimal</option>
						<option value="binary">Binary</option>
						<option value="octal">Octal</option>
						<option value="hexadecimal">Hexadecimal</option>
					</select>
				</div>
				<div>
					<label htmlFor="convertTo">To</label>
					<select id="convertTo" value={toType} onChange={(e) => setToType(e.target.value)}>
						<option value="decimal">Decimal</option>
						<option value="binary">Binary</option>
						<option value="octal">Octal</option>
						<option value="hexadecimal">Hexadecimal</option>
					</select>
				</div>
			</div>

			<label htmlFor="input" className="NumberTypeLable">
				Enter {fromType} number
			</label>
			<input
				id="input"
				className="screenInput"
				type="text"
				autoComplete="off"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				placeholder={`Enter ${fromType} number`}
			/>

			<div className="buttonBox">
				<button onClick={convertNumber}>Convert</button>
				<button onClick={reset}>Reset</button>
				<button onClick={swap}>Swap</button>
			</div>

			{result && (
				<>
					<label htmlFor="result" className="NumberTypeLable">
						Result ({toType.toUpperCase()})
					</label>
					<input id="result" type="text" className="screenInput" value={result} readOnly />
				</>
			)}
		</div>
	);
};

export default NumberConverter;
