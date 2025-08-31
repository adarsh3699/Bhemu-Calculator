import React, { useState, useCallback, useMemo } from "react";
import "../styles/numberConverter.css";
import { useMessage } from "../components/common";

const NUMBER_TYPES = {
	decimal: { label: "Decimal", base: 10 },
	binary: { label: "Binary", base: 2 },
	octal: { label: "Octal", base: 8 },
	hexadecimal: { label: "Hexadecimal", base: 16 },
};

const NumberConverter = () => {
	const { showMessage } = useMessage();
	const [fromType, setFromType] = useState("decimal");
	const [toType, setToType] = useState("binary");
	const [inputValue, setInputValue] = useState("");

	const result = useMemo(() => {
		if (!inputValue.trim()) return "";

		try {
			// Convert input to decimal first
			const decimalValue = parseInt(inputValue, NUMBER_TYPES[fromType].base);

			if (isNaN(decimalValue)) {
				return "";
			}

			// Convert decimal to target type
			const converted = decimalValue.toString(NUMBER_TYPES[toType].base);
			return toType === "hexadecimal" ? converted.toUpperCase() : converted;
		} catch (error) {
			return "";
		}
	}, [fromType, toType, inputValue]);

	const convertNumber = useCallback(() => {
		if (!inputValue.trim()) {
			showMessage("Please enter a number", "warning");
			return;
		}

		if (!result) {
			showMessage(`Invalid input for ${NUMBER_TYPES[fromType].label} number`, "error");
			return;
		}

		showMessage(`Converted successfully!`, "success");
	}, [inputValue, result, fromType, showMessage]);

	const reset = useCallback(() => {
		setInputValue("");
	}, []);

	const swap = useCallback(() => {
		setFromType(toType);
		setToType(fromType);
		setInputValue(result || "");
	}, [fromType, toType, result]);

	const handleInputChange = useCallback(
		(e) => {
			let value = e.target.value;

			// Input validation based on number type
			if (fromType === "binary" && !/^[01]*$/.test(value)) {
				value = value.replace(/[^01]/g, "");
			} else if (fromType === "octal" && !/^[0-7]*$/.test(value)) {
				value = value.replace(/[^0-7]/g, "");
			} else if (fromType === "decimal" && !/^\d*$/.test(value)) {
				value = value.replace(/[^\d]/g, "");
			} else if (fromType === "hexadecimal" && !/^[0-9A-Fa-f]*$/.test(value)) {
				value = value.replace(/[^0-9A-Fa-f]/g, "");
			}

			setInputValue(value);
		},
		[fromType]
	);

	const getPlaceholder = (type) => {
		const examples = {
			decimal: "123",
			binary: "1010",
			octal: "377",
			hexadecimal: "FF",
		};
		return `Enter ${NUMBER_TYPES[type].label.toLowerCase()} number (e.g., ${examples[type]})`;
	};

	return (
		<div id="numberConverter">
			<div className="screenTitle">Number Converter</div>

			<div className="type-selector-box">
				<div>
					<label htmlFor="convertFrom">From</label>
					<select id="convertFrom" value={fromType} onChange={(e) => setFromType(e.target.value)}>
						{Object.entries(NUMBER_TYPES).map(([key, { label }]) => (
							<option key={key} value={key}>
								{label}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="convertTo">To</label>
					<select id="convertTo" value={toType} onChange={(e) => setToType(e.target.value)}>
						{Object.entries(NUMBER_TYPES).map(([key, { label }]) => (
							<option key={key} value={key}>
								{label}
							</option>
						))}
					</select>
				</div>
			</div>

			<label htmlFor="input" className="NumberTypeLable">
				Enter {NUMBER_TYPES[fromType].label} Number
			</label>
			<input
				id="input"
				className="screenInput"
				type="text"
				autoComplete="off"
				value={inputValue}
				onChange={handleInputChange}
				placeholder={getPlaceholder(fromType)}
			/>

			<div className="buttonBox">
				<button onClick={convertNumber} disabled={!inputValue.trim()}>
					Convert
				</button>
				<button onClick={reset} disabled={!inputValue}>
					Reset
				</button>
				<button onClick={swap} disabled={!result}>
					Swap
				</button>
			</div>

			{inputValue && (
				<>
					<label htmlFor="result" className="NumberTypeLable">
						Result ({NUMBER_TYPES[toType].label})
					</label>
					<input
						id="result"
						type="text"
						className="screenInput result-input"
						value={result || "Invalid input"}
						readOnly
					/>
					{result && (
						<div className="conversion-info">
							<small>
								{NUMBER_TYPES[fromType].label} {inputValue} = {NUMBER_TYPES[toType].label} {result}
							</small>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default NumberConverter;
