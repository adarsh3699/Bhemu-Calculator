import React, { useState, useCallback, useMemo } from "react";
import { useMessage } from "../components/common";
import { ArrowsRightLeftIcon, ArrowPathIcon, PlayIcon, HashtagIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

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
		<div className="flex flex-col items-center w-full text-center transition-all duration-300 bg-[var(--background)] text-main overflow-auto min-h-[calc(100vh-80px)] py-8 px-4">
			<div className="flex items-center justify-center gap-3 mb-8">
				<HashtagIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
				<h1 className="text-3xl md:text-4xl font-extrabold text-gradient tracking-tight">Number Converter</h1>
			</div>

			<div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-8 mb-10 w-full max-w-2xl">
				<div className="flex-1 text-left">
					<label htmlFor="convertFrom" className="block text-base font-semibold mb-2 text-main">
						From
					</label>
					<select
						id="convertFrom"
						value={fromType}
						onChange={(e) => setFromType(e.target.value)}
						className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-main border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 focus:border-primary focus:shadow-[0_0_15px_rgba(102,126,234,0.3)]"
					>
						{Object.entries(NUMBER_TYPES).map(([key, { label }]) => (
							<option key={key} value={key}>
								{label}
							</option>
						))}
					</select>
				</div>
				<div className="flex-1 text-left">
					<label htmlFor="convertTo" className="block text-base font-semibold mb-2 text-main">
						To
					</label>
					<select
						id="convertTo"
						value={toType}
						onChange={(e) => setToType(e.target.value)}
						className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-main border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 focus:border-primary focus:shadow-[0_0_15px_rgba(102,126,234,0.3)]"
					>
						{Object.entries(NUMBER_TYPES).map(([key, { label }]) => (
							<option key={key} value={key}>
								{label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="w-full max-w-2xl mb-8">
				<label htmlFor="input" className="block text-base font-semibold mb-3 text-main">
					Enter {NUMBER_TYPES[fromType].label} Number
				</label>
				<input
					id="input"
					className="w-full px-6 py-4 text-lg bg-gray-50 dark:bg-white/10 text-main border-2 border-gray-300 dark:border-white/20 rounded-2xl outline-none transition-all duration-300 backdrop-blur-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:border-gray-400 dark:hover:border-white/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] focus:border-primary focus:bg-white dark:focus:bg-white/15 focus:shadow-[0_0_20px_rgba(102,126,234,0.3)] placeholder:text-gray-400 dark:placeholder:text-white/50"
					type="text"
					autoComplete="off"
					value={inputValue}
					onChange={handleInputChange}
					placeholder={getPlaceholder(fromType)}
				/>
			</div>

			<div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-8 w-full max-w-md">
				<button
					onClick={convertNumber}
					disabled={!inputValue.trim()}
					className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white border-none rounded-2xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_15px_rgba(34,197,94,0.3)]"
				>
					<PlayIcon className="w-4 h-4" />
					Convert
				</button>
				<button
					onClick={reset}
					disabled={!inputValue}
					className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white border-none rounded-2xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_15px_rgba(239,68,68,0.3)]"
				>
					<ArrowPathIcon className="w-4 h-4" />
					Reset
				</button>
				<button
					onClick={swap}
					disabled={!result}
					className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-none rounded-2xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
				>
					<ArrowsRightLeftIcon className="w-4 h-4" />
					Swap
				</button>
			</div>

			{inputValue && (
				<div className="w-full max-w-2xl">
					<label htmlFor="result" className="block text-base font-semibold mb-3 text-main">
						Result ({NUMBER_TYPES[toType].label})
					</label>
					<input
						id="result"
						type="text"
						className={`w-full px-6 py-4 text-lg border-2 rounded-2xl outline-none transition-all duration-300 backdrop-blur-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] ${
							result
								? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30"
								: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30"
						}`}
						value={result || "Invalid input"}
						readOnly
					/>
					{result && (
						<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
							<div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
								<InformationCircleIcon className="w-5 h-5" />
								<small className="text-sm font-medium">
									{NUMBER_TYPES[fromType].label} {inputValue} = {NUMBER_TYPES[toType].label} {result}
								</small>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default NumberConverter;
