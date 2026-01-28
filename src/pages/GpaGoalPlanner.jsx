import React, { useState, useEffect } from "react";
import { ChartBarIcon, ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const InputGroup = ({ label, value, onChange, placeholder, min, max, step = "0.01", type = "number" }) => {
	const id = React.useId();
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
				{label}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400"
				placeholder={placeholder}
				min={min}
				max={max}
				step={step}
			/>
		</div>
	);
};

const ResultCard = ({ requiredGpa, isPossible, remainingSemesters }) => {
	if (requiredGpa === null) return null;

	return (
		<div
			className={`mt-8 p-4 sm:p-6 rounded-2xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
				isPossible
					? requiredGpa <= 9
						? "bg-green-500/10 border-green-500/20"
						: "bg-yellow-500/10 border-yellow-500/20"
					: "bg-red-500/10 border-red-500/20"
			}`}
		>
			<div className="flex items-start gap-4">
				<div
					className={`p-3 rounded-full ${
						isPossible
							? requiredGpa <= 9
								? "bg-green-100 text-green-600"
								: "bg-yellow-100 text-yellow-600"
							: "bg-red-100 text-red-600"
					}`}
				>
					{isPossible ? (
						<CheckCircleIcon className="w-6 h-6" />
					) : (
						<ExclamationTriangleIcon className="w-6 h-6" />
					)}
				</div>
				<div>
					<h3
						className={`text-xl font-bold mb-1 ${
							isPossible
								? requiredGpa <= 9
									? "text-green-700 dark:text-green-400"
									: "text-yellow-700 dark:text-yellow-400"
								: "text-red-700 dark:text-red-400"
						}`}
					>
						{isPossible ? "Target Achievable! 🎯" : "Target Unreachable ⚠️"}
					</h3>

					{isPossible ? (
						<p className="text-gray-600 dark:text-gray-300 mt-2">
							You need to maintain an average SGPA of{" "}
							<span className="text-2xl font-bold mx-1">{requiredGpa}</span>
							for the next <span className="font-semibold">{remainingSemesters}</span> semesters.
						</p>
					) : (
						<p className="text-gray-600 dark:text-gray-300 mt-2">
							You would need an average SGPA of <span className="font-bold">{requiredGpa}</span>, which
							exceeds the maximum possible 10.0.
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

const GpaGoalPlanner = () => {
	const [currentCgpa, setCurrentCgpa] = useState("");
	const [completedSemesters, setCompletedSemesters] = useState("");
	const [totalSemesters, setTotalSemesters] = useState("8");
	const [targetCgpa, setTargetCgpa] = useState("");
	const [result, setResult] = useState(null);

	const calculateGoal = React.useCallback(() => {
		const current = parseFloat(currentCgpa);
		const completed = parseInt(completedSemesters);
		const total = parseInt(totalSemesters);
		const target = parseFloat(targetCgpa);

		if (isNaN(current) || isNaN(completed) || isNaN(total) || isNaN(target)) {
			return;
		}

		if (completed >= total) {
			setResult(null); // Or show error
			return;
		}

		const remaining = total - completed;
		// Formula: (Target * Total - Current * Completed) / Remaining
		const totalPointsNeeded = target * total;
		const currentPoints = current * completed;
		const requiredPoints = totalPointsNeeded - currentPoints;
		const requiredSgpa = requiredPoints / remaining;

		setResult({
			required: requiredSgpa.toFixed(2),
			possible: requiredSgpa <= 10 && requiredSgpa >= 0,
			remaining: remaining,
		});
	}, [currentCgpa, completedSemesters, totalSemesters, targetCgpa]);

	const handleReset = () => {
		setCurrentCgpa("");
		setCompletedSemesters("");
		setTargetCgpa("");
		setResult(null);
	};

	// Auto-calculate on change
	useEffect(() => {
		if (currentCgpa && completedSemesters && totalSemesters && targetCgpa) {
			calculateGoal();
		} else {
			setResult(null);
		}
	}, [currentCgpa, completedSemesters, totalSemesters, targetCgpa, calculateGoal]);

	return (
		<div className="flex flex-col items-center justify-start w-full min-h-[calc(100vh-80px)] p-4 md:p-5 box-border">
			{/* Header */}
			<div className="text-center mb-8 md:mb-10 relative">
				<ChartBarIcon className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-5 animate-bounce text-indigo-500" />
				<h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
					GPA Goal Planner
				</h1>
				<p className="text-lg text-gray-500 mt-2">Strategize your semesters to hit your dream CGPA</p>
			</div>

			<div className="w-full max-w-xl bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/20">
				<div className="space-y-5">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<InputGroup
							label="Current CGPA"
							value={currentCgpa}
							onChange={setCurrentCgpa}
							placeholder="e.g. 7.5"
							max="10"
						/>
						<InputGroup
							label="Completed Semesters"
							value={completedSemesters}
							onChange={setCompletedSemesters}
							placeholder="e.g. 4"
							max={totalSemesters - 1} // Can't be equal or more than total for projection
							step="1"
						/>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
								Total Course Duration
							</span>
							<span className="text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">
								Selected: {totalSemesters} Semesters
							</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							{["4", "6", "8"].map((sem) => (
								<button
									key={sem}
									onClick={() => setTotalSemesters(sem)}
									className={`py-3 rounded-xl font-semibold transition-all ${
										totalSemesters === sem
											? "bg-indigo-500 text-white shadow-lg"
											: "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
									}`}
								>
									{sem} Sem
								</button>
							))}
						</div>
					</div>

					<InputGroup
						label="Target CGPA"
						value={targetCgpa}
						onChange={setTargetCgpa}
						placeholder="e.g. 8.5"
						max="10"
					/>

					<button
						onClick={handleReset}
						className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
					>
						<ArrowPathIcon className="w-5 h-5" />
						Reset Calculator
					</button>
				</div>

				{result && (
					<ResultCard
						requiredGpa={result.required}
						isPossible={result.possible}
						remainingSemesters={result.remaining}
					/>
				)}
			</div>
		</div>
	);
};

export default GpaGoalPlanner;
