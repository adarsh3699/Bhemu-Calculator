import React, { useState, useCallback, useEffect, useMemo, useRef, memo } from "react";
import { useMessage } from "../components/common";
import "../styles/STDcalc.css";

// Unit conversion factors
const SPEED_UNITS = {
	ms: { label: "m/s", factor: 1 },
	kmh: { label: "km/h", factor: 3.6 },
	mph: { label: "mph", factor: 2.237 },
};

const DISTANCE_UNITS = {
	m: { label: "meters", factor: 1 },
	km: { label: "kilometers", factor: 0.001 },
	miles: { label: "miles", factor: 0.000621371 },
};

const TIME_UNITS = {
	s: { label: "seconds", factor: 1 },
	min: { label: "minutes", factor: 1 / 60 },
	h: { label: "hours", factor: 1 / 3600 },
};

// Optimized input field component
const InputField = memo(
	({
		field,
		icon,
		label,
		placeholder,
		value,
		unit,
		onInputChange,
		onInputFocus,
		onInputBlur,
		onUnitChange,
		onClear,
		isLastModified,
		unitOptions,
	}) => (
		<div className={`input-group ${isLastModified ? "last-modified" : ""}`}>
			<div className="input-header">
				<label htmlFor={field} className="input-label">
					<span className="input-icon">{icon}</span>
					{label}
				</label>
				<select className="unit-selector" value={unit} onChange={(e) => onUnitChange(field, e.target.value)}>
					{unitOptions.map(([key, { label }]) => (
						<option key={key} value={key}>
							{label}
						</option>
					))}
				</select>
			</div>
			<div className="input-wrapper">
				<input
					id={field}
					type="number"
					step="any"
					min="0"
					className="modern-input"
					value={value}
					onChange={(e) => onInputChange(field, e.target.value)}
					onFocus={() => onInputFocus(field)}
					onBlur={() => onInputBlur()}
					onWheel={(e) => e.target.blur()}
					onKeyDown={(e) => {
						// Prevent arrow keys from changing the value
						if (e.key === "ArrowUp" || e.key === "ArrowDown") {
							e.preventDefault();
						}
					}}
					placeholder={placeholder}
				/>
				{value && (
					<button className="clear-input" onClick={() => onClear(field)} title="Clear input">
						✕
					</button>
				)}
			</div>
		</div>
	)
);

const SpeedDistanceTimeCalculator = () => {
	const { showMessage } = useMessage();

	// Input values and units
	const [values, setValues] = useState({
		speed: "",
		distance: "",
		time: "",
	});

	const [units, setUnits] = useState({
		speed: "ms",
		distance: "m",
		time: "s",
	});

	const [lastModified, setLastModified] = useState(null);

	// Refs to track focus and prevent unwanted calculations
	const activeFieldRef = useRef(null);
	const calculationTimeoutRef = useRef(null);

	// Simplified conversion functions
	const convertToBase = useCallback((value, type, unit) => {
		if (!value || isNaN(value)) return 0;
		const num = parseFloat(value);
		const unitData =
			type === "speed" ? SPEED_UNITS[unit] : type === "distance" ? DISTANCE_UNITS[unit] : TIME_UNITS[unit];
		return num / unitData.factor;
	}, []);

	const convertFromBase = useCallback((baseValue, type, unit) => {
		if (!baseValue || isNaN(baseValue)) return "";
		const unitData =
			type === "speed" ? SPEED_UNITS[unit] : type === "distance" ? DISTANCE_UNITS[unit] : TIME_UNITS[unit];
		return (baseValue * unitData.factor).toFixed(3);
	}, []);

	// Optimized calculation function
	const calculate = useCallback(() => {
		const filledFields = Object.entries(values).filter(([_, value]) => value !== "");

		// Don't calculate if user is actively typing or less than 2 fields filled
		if (filledFields.length < 2 || activeFieldRef.current) return;

		const baseSpeed = convertToBase(values.speed, "speed", units.speed);
		const baseDistance = convertToBase(values.distance, "distance", units.distance);
		const baseTime = convertToBase(values.time, "time", units.time);

		let newValues = { ...values };
		let calculated = false;

		// Core concept: Calculate the field that's empty OR the field that wasn't last modified
		if (filledFields.length === 2) {
			// Two fields filled - calculate the empty one
			if (!values.speed && baseTime > 0) {
				newValues.speed = convertFromBase(baseDistance / baseTime, "speed", units.speed);
				calculated = true;
			} else if (!values.distance) {
				newValues.distance = convertFromBase(baseSpeed * baseTime, "distance", units.distance);
				calculated = true;
			} else if (!values.time && baseSpeed > 0) {
				newValues.time = convertFromBase(baseDistance / baseSpeed, "time", units.time);
				calculated = true;
			}
		} else if (filledFields.length === 3 && lastModified) {
			// All three fields filled - recalculate the field that wasn't last modified
			// Keep the last modified field and one other, calculate the third
			if (lastModified === "speed") {
				// User changed speed, keep speed and distance, recalculate time
				if (baseSpeed > 0) {
					newValues.time = convertFromBase(baseDistance / baseSpeed, "time", units.time);
					calculated = true;
				}
			} else if (lastModified === "distance") {
				// User changed distance, keep speed and distance, recalculate time
				if (baseSpeed > 0) {
					newValues.time = convertFromBase(baseDistance / baseSpeed, "time", units.time);
					calculated = true;
				}
			} else if (lastModified === "time") {
				// User changed time, keep speed and time, recalculate distance
				newValues.distance = convertFromBase(baseSpeed * baseTime, "distance", units.distance);
				calculated = true;
			}
		}

		if (calculated) {
			setValues(newValues);
			showMessage("✓ Calculated!", "success");
		}
	}, [values, units, convertToBase, convertFromBase, showMessage, lastModified]);

	// Smooth auto-calculation
	useEffect(() => {
		if (calculationTimeoutRef.current) {
			clearTimeout(calculationTimeoutRef.current);
		}

		const filledCount = Object.values(values).filter((v) => v !== "").length;
		if (filledCount >= 2 && !activeFieldRef.current) {
			calculationTimeoutRef.current = setTimeout(calculate, 500);
		}

		return () => {
			if (calculationTimeoutRef.current) {
				clearTimeout(calculationTimeoutRef.current);
			}
		};
	}, [values, calculate]);

	// Streamlined handlers
	const handleInputChange = useCallback((field, value) => {
		if (value !== "" && (isNaN(value) || parseFloat(value) < 0)) return;

		setValues((prev) => (prev[field] === value ? prev : { ...prev, [field]: value }));
		setLastModified(field);
	}, []);

	const handleInputFocus = useCallback((field) => {
		activeFieldRef.current = field;
		if (calculationTimeoutRef.current) {
			clearTimeout(calculationTimeoutRef.current);
		}
	}, []);

	const handleInputBlur = useCallback(() => {
		setTimeout(() => {
			activeFieldRef.current = null;
		}, 100);
	}, []);

	const handleClear = useCallback((field) => {
		setValues((prev) => ({ ...prev, [field]: "" }));
		setLastModified(field);
		activeFieldRef.current = null;
	}, []);

	const handleUnitChange = useCallback(
		(field, newUnit) => {
			setUnits((prev) => ({ ...prev, [field]: newUnit }));

			if (values[field] && values[field] !== "0") {
				const baseValue = convertToBase(values[field], field, units[field]);
				const convertedValue = convertFromBase(baseValue, field, newUnit);
				setValues((prev) => ({ ...prev, [field]: convertedValue }));
			}
		},
		[values, units, convertToBase, convertFromBase]
	);

	const reset = useCallback(() => {
		setValues({ speed: "", distance: "", time: "" });
		setLastModified(null);
		activeFieldRef.current = null;
		if (calculationTimeoutRef.current) clearTimeout(calculationTimeoutRef.current);
	}, []);

	const fillExample = useCallback(() => {
		activeFieldRef.current = null;
		setValues({
			speed: "60",
			distance: "120",
			time: "",
		});
		setUnits({
			speed: "kmh",
			distance: "km",
			time: "h",
		});
	}, []);

	// Memoized options for better performance
	const unitOptions = useMemo(
		() => ({
			speed: Object.entries(SPEED_UNITS),
			distance: Object.entries(DISTANCE_UNITS),
			time: Object.entries(TIME_UNITS),
		}),
		[]
	);

	// Live results calculation
	const results = useMemo(() => {
		const filledCount = Object.values(values).filter((v) => v !== "").length;
		if (filledCount < 2) return null;

		const baseSpeed = convertToBase(values.speed, "speed", units.speed);
		const baseDistance = convertToBase(values.distance, "distance", units.distance);
		const baseTime = convertToBase(values.time, "time", units.time);

		return {
			speed: values.speed || convertFromBase(baseDistance / baseTime, "speed", units.speed),
			distance: values.distance || convertFromBase(baseSpeed * baseTime, "distance", units.distance),
			time: values.time || convertFromBase(baseDistance / baseSpeed, "time", units.time),
		};
	}, [values, units, convertToBase, convertFromBase]);

	return (
		<div id="STDcalc">
			<div className="calculator-header">
				<div className="header-icon">⚡</div>
				<h1 className="calculator-title">Speed Distance Time Calculator</h1>
				<p className="calculator-subtitle">Enter any two values to calculate the third automatically</p>
			</div>

			<div className="calculator-body">
				<div className="inputs-container">
					<InputField
						field="speed"
						icon="🏃"
						label="Speed"
						placeholder="Enter speed"
						value={values.speed}
						unit={units.speed}
						onInputChange={handleInputChange}
						onInputFocus={handleInputFocus}
						onInputBlur={handleInputBlur}
						onUnitChange={handleUnitChange}
						onClear={handleClear}
						isLastModified={lastModified === "speed"}
						unitOptions={unitOptions.speed}
					/>

					<InputField
						field="distance"
						icon="📏"
						label="Distance"
						placeholder="Enter distance"
						value={values.distance}
						unit={units.distance}
						onInputChange={handleInputChange}
						onInputFocus={handleInputFocus}
						onInputBlur={handleInputBlur}
						onUnitChange={handleUnitChange}
						onClear={handleClear}
						isLastModified={lastModified === "distance"}
						unitOptions={unitOptions.distance}
					/>

					<InputField
						field="time"
						icon="⏱️"
						label="Time"
						placeholder="Enter time"
						value={values.time}
						unit={units.time}
						onInputChange={handleInputChange}
						onInputFocus={handleInputFocus}
						onInputBlur={handleInputBlur}
						onUnitChange={handleUnitChange}
						onClear={handleClear}
						isLastModified={lastModified === "time"}
						unitOptions={unitOptions.time}
					/>
				</div>

				{results && (
					<div className="results-container">
						<h3 className="results-title">📊 Live Results</h3>
						<div className="results-grid">
							<div className="result-card speed">
								<div className="result-icon">🏃</div>
								<div className="result-content">
									<span className="result-label">Speed</span>
									<span className="result-value">
										{parseFloat(results.speed).toFixed(2)} {SPEED_UNITS[units.speed].label}
									</span>
								</div>
							</div>

							<div className="result-card distance">
								<div className="result-icon">📏</div>
								<div className="result-content">
									<span className="result-label">Distance</span>
									<span className="result-value">
										{parseFloat(results.distance).toFixed(2)} {DISTANCE_UNITS[units.distance].label}
									</span>
								</div>
							</div>

							<div className="result-card time">
								<div className="result-icon">⏱️</div>
								<div className="result-content">
									<span className="result-label">Time</span>
									<span className="result-value">
										{parseFloat(results.time).toFixed(2)} {TIME_UNITS[units.time].label}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="action-buttons">
					<button className="action-btn reset-btn" onClick={reset}>
						<span className="btn-icon">🔄</span>
						Reset
					</button>
					<button className="action-btn example-btn" onClick={fillExample}>
						<span className="btn-icon">💡</span>
						Example
					</button>
				</div>

				<div className="formula-section">
					<h3 className="formula-title">📐 Formulas</h3>
					<div className="formula-grid">
						<div className="formula-card">
							<div className="formula-name">Speed</div>
							<div className="formula-equation">Distance ÷ Time</div>
						</div>
						<div className="formula-card">
							<div className="formula-name">Distance</div>
							<div className="formula-equation">Speed × Time</div>
						</div>
						<div className="formula-card">
							<div className="formula-name">Time</div>
							<div className="formula-equation">Distance ÷ Speed</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SpeedDistanceTimeCalculator;
