import React, { useCallback, useMemo, useState, useRef } from "react";
import { useMessage } from "../components/common";
import { ArrowPathIcon, ClipboardDocumentIcon, Squares2X2Icon, SparklesIcon } from "@heroicons/react/24/outline";

const MatrixDeterminantCalculator = () => {
	const { showMessage } = useMessage();
	const [size, setSize] = useState(2);
	const [matrix, setMatrix] = useState(() =>
		Array(2)
			.fill()
			.map(() => Array(2).fill(""))
	);
	const inputRefs = useRef({});

	// Update matrix when size changes
	const updateMatrixSize = useCallback(
		(newSize) => {
			const newMatrix = Array(newSize)
				.fill()
				.map((_, i) =>
					Array(newSize)
						.fill()
						.map((_, j) => {
							// Keep existing values if available
							return matrix[i]?.[j] || "";
						})
				);
			setMatrix(newMatrix);
		},
		[matrix]
	);

	const handleSizeChange = useCallback(
		(e) => {
			const value = e.target.value;

			if (value === "") {
				setSize("");
				return;
			}

			const numValue = parseInt(value);
			if (isNaN(numValue)) return;

			// Validate size range
			if (numValue > 5) {
				showMessage("Matrix size cannot be greater than 5", "warning");
			}
			if (numValue < 1) {
				showMessage("Matrix size cannot be less than 1", "warning");
			}

			const validSize = Math.max(1, Math.min(5, numValue));
			setSize(validSize);
			updateMatrixSize(validSize);
		},
		[updateMatrixSize, showMessage]
	);

	const handleCellChange = useCallback((i, j, value) => {
		setMatrix((prev) =>
			prev.map((row, rowIndex) => row.map((cell, colIndex) => (rowIndex === i && colIndex === j ? value : cell)))
		);
	}, []);

	const handleKeyNavigation = useCallback(
		(e, i, j) => {
			if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();

				const currentSize = size === "" ? 2 : size;
				let nextI = i;
				let nextJ = j + 1;

				// Move to next row if at end of current row
				if (nextJ >= currentSize) {
					nextI = i + 1;
					nextJ = 0;
				}

				// Wrap to first cell if at end
				if (nextI >= currentSize) {
					nextI = 0;
					nextJ = 0;
				}

				// Focus next input
				const nextInput = inputRefs.current[`${nextI}-${nextJ}`];
				if (nextInput) {
					nextInput.focus();
					nextInput.select();
				}
			}
		},
		[size]
	);

	const calculateDeterminant = useCallback((mat) => {
		const n = mat.length;

		// Convert to numbers, treating empty/invalid as 0
		const numMatrix = mat.map((row) =>
			row.map((cell) => {
				const num = parseFloat(cell);
				return isNaN(num) ? 0 : num;
			})
		);

		// Base cases
		if (n === 1) return numMatrix[0][0];
		if (n === 2) {
			return numMatrix[0][0] * numMatrix[1][1] - numMatrix[0][1] * numMatrix[1][0];
		}

		// Recursive calculation for larger matrices
		let det = 0;
		for (let i = 0; i < n; i++) {
			// Create minor matrix (remove first row and ith column)
			const minor = numMatrix.slice(1).map((row) => row.filter((_, colIndex) => colIndex !== i));

			const cofactor = (i % 2 === 0 ? 1 : -1) * numMatrix[0][i];
			det += cofactor * calculateDeterminant(minor);
		}

		return det;
	}, []);

	const determinant = useMemo(() => {
		if (size === "" || !matrix.length) return 0;

		try {
			return calculateDeterminant(matrix);
		} catch (error) {
			showMessage("Error calculating determinant", "error");
			return 0;
		}
	}, [matrix, size, calculateDeterminant, showMessage]);

	const resetMatrix = useCallback(() => {
		const currentSize = size === "" ? 2 : size;
		setMatrix(
			Array(currentSize)
				.fill()
				.map(() => Array(currentSize).fill(""))
		);

		// Focus first input
		const firstInput = inputRefs.current["0-0"];
		if (firstInput) {
			setTimeout(() => firstInput.focus(), 100);
		}
	}, [size]);

	const fillRandomMatrix = useCallback(() => {
		const currentSize = size === "" ? 2 : size;
		const randomMatrix = Array(currentSize)
			.fill()
			.map(() =>
				Array(currentSize)
					.fill()
					.map(
						() => (Math.random() * 20 - 10).toFixed(0) // Random integers between -10 and 10
					)
			);
		setMatrix(randomMatrix);
		showMessage("Matrix filled with random values", "success");
	}, [size, showMessage]);

	const copyResult = useCallback(() => {
		const result = Number.isInteger(determinant) ? determinant.toString() : determinant.toFixed(4);
		navigator.clipboard
			.writeText(result)
			.then(() => {
				showMessage("Determinant copied to clipboard", "success");
			})
			.catch(() => {
				showMessage("Failed to copy to clipboard", "error");
			});
	}, [determinant, showMessage]);

	// Display formatted determinant
	const displayDeterminant = useMemo(() => {
		if (determinant === 0) return "0";
		return Number.isInteger(determinant) ? determinant : determinant.toFixed(4);
	}, [determinant]);

	const currentSize = size === "" ? 2 : size;

	return (
		<div className="flex flex-col items-center w-full min-h-[calc(100vh-80px)] text-center transition-all duration-300 bg-[var(--background)] text-main py-5 px-4 box-border overflow-auto">
			<div className="flex items-center justify-center gap-3 mb-8">
				<Squares2X2Icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
				<h1 className="text-3xl md:text-4xl font-extrabold text-gradient tracking-tight">
					Matrix Determinant Calculator
				</h1>
			</div>

			<div className="flex flex-col items-center w-full max-w-2xl mb-8 gap-5">
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 px-6 sm:px-8 py-5 bg-white/90 dark:bg-white/10 backdrop-blur-[20px] rounded-2xl border border-gray-200 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.1)] w-full">
					<label
						htmlFor="matrixSize"
						className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-sm sm:text-base font-semibold text-main tracking-wide"
					>
						Matrix Size:
						<input
							id="matrixSize"
							type="number"
							min="1"
							max="5"
							value={size}
							onChange={handleSizeChange}
							className="w-16 sm:w-18 px-4 sm:px-5 py-2 sm:py-3 text-base sm:text-lg font-bold text-center bg-gray-50 dark:bg-white/10 border-2 border-gray-300 dark:border-white/30 rounded-xl text-main transition-all duration-300 outline-none shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:border-gray-400 dark:hover:border-white/50 focus:-translate-y-0.5 focus:border-primary focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]"
						/>
					</label>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
					<button
						onClick={resetMatrix}
						className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-red-400 to-red-600 text-white border-none rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(239,68,68,0.3)] relative overflow-hidden whitespace-nowrap hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] active:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full w-full sm:w-auto"
					>
						<ArrowPathIcon className="w-4 h-4" />
						Clear Matrix
					</button>
					<button
						onClick={fillRandomMatrix}
						className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(139,92,246,0.3)] relative overflow-hidden whitespace-nowrap hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(139,92,246,0.4)] active:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full w-full sm:w-auto"
					>
						<SparklesIcon className="w-4 h-4" />
						Random Values
					</button>
				</div>
			</div>

			<div className="my-6 w-full flex justify-center">
				<div
					className="grid gap-3 p-6 bg-white/90 dark:bg-white/10 backdrop-blur-[20px] rounded-2xl border-2 border-gray-200 dark:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.1)] max-w-lg relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-gradient-to-br before:from-white/10 before:to-white/5 before:pointer-events-none"
					style={{
						gridTemplateColumns: `repeat(${currentSize}, 1fr)`,
					}}
				>
					{matrix.map((row, i) =>
						row.map((value, j) => (
							<input
								key={`${i}-${j}`}
								ref={(el) => (inputRefs.current[`${i}-${j}`] = el)}
								type="number"
								step="any"
								value={value}
								onChange={(e) => handleCellChange(i, j, e.target.value)}
								onKeyDown={(e) => handleKeyNavigation(e, i, j)}
								className="w-full min-w-[55px] sm:min-w-[70px] px-3 sm:px-4 py-3 sm:py-4 bg-gray-50/50 dark:bg-white/5 backdrop-blur-[10px] rounded-xl border-2 border-gray-300 dark:border-white/30 text-sm sm:text-base font-semibold text-center box-border outline-none text-main transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.1)] relative z-10 hover:-translate-y-0.5 hover:border-gray-400 dark:hover:border-white/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] focus:-translate-y-0.5 focus:border-primary focus:shadow-[0_0_25px_rgba(102,126,234,0.4)] focus:bg-white dark:focus:bg-white/20 placeholder:text-gray-400 dark:placeholder:text-white/60 placeholder:opacity-100 placeholder:text-xs sm:placeholder:text-sm placeholder:font-medium"
								placeholder={`a${i + 1}${j + 1}`}
								title={`Row ${i + 1}, Column ${j + 1}`}
							/>
						))
					)}
				</div>
			</div>

			<div className="my-6 w-full max-w-2xl">
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 px-5 sm:px-6 py-5 sm:py-6 bg-green-500/10 dark:bg-green-500/10 backdrop-blur-[20px] border-2 border-green-500/30 rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.1)] relative overflow-hidden mb-4 animate-[float_8s_ease-in-out_infinite] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-gradient-to-br before:from-green-500/5 before:to-emerald-500/10 before:pointer-events-none max-w-[90vw] sm:max-w-none">
					<h3 className="text-lg sm:text-2xl font-extrabold text-green-500 m-0 text-shadow-[0_2px_10px_rgba(34,197,94,0.3)] tracking-tight relative z-10">
						Determinant = {displayDeterminant}
					</h3>
					<button
						onClick={copyResult}
						className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-none rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(6,182,212,0.3)] relative z-10 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(6,182,212,0.4)] active:-translate-y-0.5"
						title="Copy result to clipboard"
					>
						<ClipboardDocumentIcon className="w-4 h-4" />
						Copy
					</button>
				</div>

				{matrix.some((row) => row.some((cell) => cell !== "")) && (
					<div className="px-5 py-4 bg-gray-50/50 dark:bg-white/5 backdrop-blur-[10px] border border-gray-200 dark:border-white/10 rounded-xl text-center">
						<small className="text-gray-600 dark:text-white/70 text-sm font-medium">
							Matrix size: {currentSize}×{currentSize} | Filled cells:{" "}
							{matrix.flat().filter((cell) => cell !== "").length}/{currentSize * currentSize}
						</small>
					</div>
				)}
			</div>
		</div>
	);
};

export default MatrixDeterminantCalculator;
