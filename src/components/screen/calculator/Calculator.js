import React, { useCallback, useState } from 'react';
import './calculator.css';

function Calculator() {
	const [value, setValue] = useState('');
	const [history, setHistory] = useState([]);

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
			console.log(result);
			if (result === undefined) return;
			if (String(result).split('.')[1]?.length > 12) {
				const answer = result.toFixed(3).replace(/\.?0*$/, '');
				setValue(answer);
				if (history[0] !== `${value} = ${answer}`) setHistory([`${value} = ${answer}`, ...history]);
			} else {
				setValue(result);
				if (history[0] !== `${value} = ${result}`) setHistory([`${value} = ${result}`, ...history]);
			}
		} catch (error) {
			console.log(error);
		}
	}, [history, value]);

	const handleClearBtn = useCallback(() => {
		setValue('');
	}, []);
	return (
		<div className="calculatorBg">
			<div className="left">
				<div className="calculator">
					<input type="text" id="value" value={value} onChange={handleInputChange} autoComplete="off" />
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
			<div className="calcHistory right">
				<button className="arrow" type="button" aria-label="Hide">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 13 96"
						width="13"
						height="96"
						fill="none"
						className="IrLwCg"
					>
						<path className="arowCurve" d="M0,0 h1 c0,20,12,12,12,32 v32 c0,20,-12,12,-12,32 H0 z"></path>
						<path className="arowBorder" d="M0.5,0 c0,20,12,12,12,32 v32 c0,20,-12,12,-12,32"></path>
					</svg>
					<div className="arrowIconDiv">
						<span aria-hidden="true" className="R3BUpw dkWypw RMcv3A lmfTqA">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 12 12"
								fill="none"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeWidth="1.25"
									d="M7 3.17 4.88 5.3a1 1 0 0 0 0 1.42L7 8.83"
								></path>
							</svg>
						</span>
					</div>
				</button>

				<div className="historyTitle">
					<h1>History</h1>
					<div className="clearIcon" onClick={() => setHistory([])}></div>
				</div>
				{history.length === 0 ? (
					<div className="historyList">No history</div>
				) : (
					history.map((item, index) => (
						<div key={index} className="historyList">
							{item}
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default Calculator;
