'use client';

import React, { useState } from 'react';
import './numberConverter.css';

const NumberConverter = () => {
	const [fromType, setFromType] = useState('decimal');
	const [toType, setToType] = useState('binary');
	const [inputValue, setInputValue] = useState('');
	const [result, setResult] = useState('');

	const convertNumber = () => {
		let decimal;

		switch (fromType) {
			case 'binary':
				decimal = parseInt(inputValue, 2);
				break;
			case 'octal':
				decimal = parseInt(inputValue, 8);
				break;
			case 'hexadecimal':
				decimal = parseInt(inputValue, 16);
				break;
			default:
				decimal = parseInt(inputValue, 10);
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
	};

	const reset = () => {
		setInputValue('');
		setResult('');
	};

	const swap = () => {
		setFromType(toType);
		setToType(fromType);
		setInputValue('');
		setResult('');
	};

	return (
		<div className="number-converter">
			<h1>Number Converter</h1>

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

			<div className="input-box">
				<label htmlFor="input">Enter {fromType} number</label>
				<input
					id="input"
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={`Enter ${fromType} number`}
				/>
			</div>

			<div className="button-box">
				<button onClick={convertNumber}>Convert</button>
				<button onClick={reset}>Reset</button>
				<button onClick={swap}>Swap</button>
			</div>

			{result && (
				<div className="result-box">
					<label htmlFor="result">Result ({toType})</label>
					<input id="result" type="text" value={result} readOnly />
				</div>
			)}
		</div>
	);
};

export default NumberConverter;
