import React, { useState, useCallback, useEffect, useMemo, useRef, memo } from "react";
import { useMessage } from "../components/common";
import {
	BoltIcon,
	ArrowPathIcon,
	LightBulbIcon,
	RocketLaunchIcon,
	MapIcon,
	ClockIcon,
	XMarkIcon,
	CalculatorIcon,
} from "@heroicons/react/24/outline";

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
		icon: IconComponent,
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
		<div className={`relative transition-all duration-300 ${isLastModified ? "scale-105" : ""}`}>
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
				<label htmlFor={field} className="flex items-center text-base sm:text-lg font-semibold text-main gap-2">
					<IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary filter drop-shadow-[0_0_8px_rgba(102,126,234,0.3)]" />
					{label}
				</label>
				<select
					className="bg-gray-100 dark:bg-white/10 border-2 border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm text-main cursor-pointer transition-all duration-300 backdrop-blur-[10px] hover:border-primary/50 hover:bg-gray-200 dark:hover:bg-white/15 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)] self-end sm:self-auto"
					value={unit}
					onChange={(e) => onUnitChange(field, e.target.value)}
				>
					{unitOptions.map(([key, { label }]) => (
						<option key={key} value={key}>
							{label}
						</option>
					))}
				</select>
			</div>
			<div className="relative flex items-center">
				<input
					id={field}
					type="number"
					step="any"
					min="0"
					className="w-full px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl border-2 border-gray-300 dark:border-white/20 rounded-2xl bg-gray-50 dark:bg-white/10 text-main transition-all duration-300 backdrop-blur-[10px] box-border focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2),0_8px_25px_rgba(102,126,234,0.15)] focus:-translate-y-0.5 placeholder:text-gray-400 dark:placeholder:text-white/50"
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
					<button
						className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500/10 border-none rounded-full w-8 h-8 cursor-pointer text-red-400 flex items-center justify-center transition-all duration-200 hover:bg-red-500/20 hover:scale-110"
						onClick={() => onClear(field)}
						title="Clear input"
					>
						<XMarkIcon className="w-4 h-4" />
					</button>
				)}
			</div>
		</div>
	)
);

InputField.displayName = "InputField";

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

		const newValues = { ...values };
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
		<div className="flex flex-col items-center justify-start w-full min-h-[calc(100vh-80px)] p-4 md:p-5 box-border relative overflow-x-hidden">
			<div className="text-center mb-8 md:mb-10 relative">
				<BoltIcon className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-5 animate-bounce text-yellow-500 filter drop-shadow-[0_0_20px_rgba(255,193,7,0.5)]" />
				<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold m-0 mb-2.5 text-gradient relative">
					Speed Distance Time Calculator
				</h1>
				<p className="text-base md:text-lg opacity-80 m-0 font-normal text-[var(--text-light)] px-4">
					Enter any two values to calculate the third automatically
				</p>
			</div>

			<div className="w-full max-w-4xl bg-white/90 dark:bg-white/10 backdrop-blur-[20px] rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.1)] border border-gray-200 dark:border-white/20 relative box-border before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gray-300 before:to-transparent dark:before:via-white/40">
				<div className="grid grid-cols-1 gap-7 mb-10">
					<InputField
						field="speed"
						icon={RocketLaunchIcon}
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
						icon={MapIcon}
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
						icon={ClockIcon}
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
					<div className="my-10 p-7 bg-gradient-to-br from-primary/5 to-primary-hover/5 dark:from-primary/10 dark:to-primary-hover/10 rounded-2xl border border-gray-200 dark:border-white/10 animate-[fadeInUp_0.5s_ease]">
						<h3 className="text-center text-2xl font-semibold m-0 mb-6 text-main flex items-center justify-center gap-2">
							<CalculatorIcon className="w-6 h-6 text-primary" />
							Live Results
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
							<div className="bg-white/80 dark:bg-white/10 rounded-2xl p-5 text-center transition-all duration-300 border border-gray-200 dark:border-white/10 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] border-l-4 border-l-green-500 before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full">
								<div className="mb-3">
									<RocketLaunchIcon className="w-8 h-8 mx-auto text-green-500 filter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
								</div>
								<div className="flex flex-col gap-2">
									<span className="text-sm font-medium opacity-80 text-light">Speed</span>
									<span className="text-2xl font-bold text-main">
										{parseFloat(results.speed).toFixed(2)} {SPEED_UNITS[units.speed].label}
									</span>
								</div>
							</div>

							<div className="bg-white/80 dark:bg-white/10 rounded-2xl p-5 text-center transition-all duration-300 border border-gray-200 dark:border-white/10 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] border-l-4 border-l-blue-500 before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full">
								<div className="mb-3">
									<MapIcon className="w-8 h-8 mx-auto text-blue-500 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
								</div>
								<div className="flex flex-col gap-2">
									<span className="text-sm font-medium opacity-80 text-light">Distance</span>
									<span className="text-2xl font-bold text-main">
										{parseFloat(results.distance).toFixed(2)} {DISTANCE_UNITS[units.distance].label}
									</span>
								</div>
							</div>

							<div className="bg-white/80 dark:bg-white/10 rounded-2xl p-5 text-center transition-all duration-300 border border-gray-200 dark:border-white/10 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] border-l-4 border-l-orange-500 before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full">
								<div className="mb-3">
									<ClockIcon className="w-8 h-8 mx-auto text-orange-500 filter drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
								</div>
								<div className="flex flex-col gap-2">
									<span className="text-sm font-medium opacity-80 text-light">Time</span>
									<span className="text-2xl font-bold text-main">
										{parseFloat(results.time).toFixed(2)} {TIME_UNITS[units.time].label}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center my-7">
					<button
						className="flex items-center justify-center gap-2 px-7 py-3 border-none rounded-2xl text-base font-semibold cursor-pointer transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-red-400 to-red-600 text-white shadow-[0_8px_25px_rgba(239,68,68,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(239,68,68,0.4)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-[left] before:duration-300 hover:before:left-full w-full sm:w-auto"
						onClick={reset}
					>
						<ArrowPathIcon className="w-5 h-5" />
						Reset
					</button>
					<button
						className="flex items-center justify-center gap-2 px-7 py-3 border-none rounded-2xl text-base font-semibold cursor-pointer transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-[0_8px_25px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(59,130,246,0.4)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-[left] before:duration-300 hover:before:left-full w-full sm:w-auto"
						onClick={fillExample}
					>
						<LightBulbIcon className="w-5 h-5" />
						Example
					</button>
				</div>

				<div className="mt-10 p-7 bg-gray-50 dark:bg-black/10 rounded-2xl border border-gray-200 dark:border-white/10">
					<h3 className="text-center text-2xl font-semibold m-0 mb-6 text-main flex items-center justify-center gap-2">
						<CalculatorIcon className="w-6 h-6 text-primary" />
						Formulas
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
						<div className="bg-white/90 dark:bg-white/5 rounded-xl p-5 text-center border border-gray-200 dark:border-white/10 transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:-translate-y-0.5">
							<div className="text-lg font-semibold mb-3 text-main">Speed</div>
							<div className="font-mono text-base text-light bg-gray-100 dark:bg-black/20 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10">
								Distance ÷ Time
							</div>
						</div>
						<div className="bg-white/90 dark:bg-white/5 rounded-xl p-5 text-center border border-gray-200 dark:border-white/10 transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:-translate-y-0.5">
							<div className="text-lg font-semibold mb-3 text-main">Distance</div>
							<div className="font-mono text-base text-light bg-gray-100 dark:bg-black/20 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10">
								Speed × Time
							</div>
						</div>
						<div className="bg-white/90 dark:bg-white/5 rounded-xl p-5 text-center border border-gray-200 dark:border-white/10 transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:-translate-y-0.5">
							<div className="text-lg font-semibold mb-3 text-main">Time</div>
							<div className="font-mono text-base text-light bg-gray-100 dark:bg-black/20 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10">
								Distance ÷ Speed
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SpeedDistanceTimeCalculator;
