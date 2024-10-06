import React, { useState } from 'react';
import './matrixCalc.css';
import * as math from 'mathjs';

function MatrixCalc() {
	const [rows, setRows] = useState(0);
	const [cols, setCols] = useState(0);
	const [matrix, setMatrix] = useState([]);
	const [det, setDet] = useState(null);

	const handleRowChange = (e) => {
		setRows(Number(e.target.value));
		setMatrix([]);
	};

	const handleColChange = (e) => {
		setCols(Number(e.target.value));
		setMatrix([]);
	};

	const handleMatrixCreation = (e) => {
		e.preventDefault();
		if (rows > 0 && cols > 0) {
			setMatrix(Array.from({ length: rows }, () => Array(cols).fill(0)));
		}
	};

	const handleMatrixChange = (e, rowIndex, colIndex) => {
		const updatedMatrix = [...matrix];
		updatedMatrix[rowIndex][colIndex] = Number(e.target.value);
		setMatrix(updatedMatrix);
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (rows !== cols) {
			alert('Determinant can only be calculated for square matrices.');
			return;
		}

		try {
			const result = math.det(matrix); // Use math.det to calculate determinant
			setDet(result);
		} catch (error) {
			console.log(error);

			alert('Error calculating determinant');
		}
	};

	const createMatrixInputs = () => {
		const inputs = [];
		for (let i = 0; i < rows; i++) {
			inputs.push(
				<div key={i} className="matrix-row">
					{Array.from({ length: cols }).map((_, j) => (
						<input
							key={j}
							type="number"
							className="matrixBoxInput"
							value={matrix[i] && matrix[i][j] ? matrix[i][j] : ''}
							onChange={(e) => handleMatrixChange(e, i, j)}
							placeholder={`[C${i + 1}, R${j + 1}]`}
						/>
					))}
				</div>
			);
		}
		return inputs;
	};

	return (
		<div id="matrixCalc">
			<div className="screenTitle">Matrix Determinant Calculator</div>

			<form className="matrixCalcForm" onSubmit={handleMatrixCreation}>
				<div className="matrixLableInput">
					<label htmlFor="matrixRow" className="matrixLable">
						Matrix Row
					</label>

					<input
						type="number"
						id="matrixRow"
						className="screenInput f"
						name="matrixRow"
						placeholder="Enter No. of rows"
						autoComplete="off"
						// value={rows}
						onChange={handleRowChange}
					/>
				</div>
				<div className="matrixLableInput">
					<label htmlFor="matrixCol" className="matrixLable">
						Matrix columns
					</label>

					<input
						type="number"
						className="screenInput matrixRowColsInput"
						name="matrixCol"
						placeholder="Enter No. of columns"
						autoComplete="off"
						// value={cols}
						onChange={handleColChange}
					/>
				</div>

				<button type="submit" className="ScreenBtn" style={{ margin: 'unset' }}>
					Create
				</button>
			</form>

			{matrix.length > 0 && (
				<form style={{ width: '100%' }} onSubmit={handleSubmit}>
					<div className="matrixBox">{createMatrixInputs()}</div>
					<button type="submit" className="ScreenBtn">
						Calculate Determinant
					</button>
				</form>
			)}

			{det !== null && (
				<div className="result">
					<h3>Determinant: {det}</h3>
				</div>
			)}
		</div>
	);
}

export default MatrixCalc;
