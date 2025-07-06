import React, { useCallback, useMemo, useState, useRef } from "react";
import { useMessage } from "../components/common";
import "../styles/matrixCalc.css";

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
		<div id="matrixCalc">
			<div className="screenTitle">Matrix Determinant Calculator</div>

			<div className="controls">
				<div className="matrixSizeContainer">
					<label htmlFor="matrixSize">
						Matrix Size:
						<input id="matrixSize" type="number" min="1" max="5" value={size} onChange={handleSizeChange} />
					</label>
				</div>

				<div className="action-buttons">
					<button onClick={resetMatrix} className="resetBtn">
						Clear Matrix
					</button>
					<button onClick={fillRandomMatrix} className="randomBtn">
						Random Values
					</button>
				</div>
			</div>

			<div className="matrixContainer">
				<div
					className="matrix"
					style={{
						gridTemplateColumns: `repeat(${currentSize}, 1fr)`,
						gap: "8px",
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
								className="matrixInput"
								placeholder={`a${i + 1}${j + 1}`}
								title={`Row ${i + 1}, Column ${j + 1}`}
							/>
						))
					)}
				</div>
			</div>

			<div className="result">
				<div className="determinant-display">
					<h3>Determinant = {displayDeterminant}</h3>
					<button onClick={copyResult} className="copyBtn" title="Copy result to clipboard">
						📋 Copy
					</button>
				</div>

				{matrix.some((row) => row.some((cell) => cell !== "")) && (
					<div className="matrix-info">
						<small>
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
