import React, { useState } from "react";
import { CalculatorIcon, AcademicCapIcon, BeakerIcon, BookOpenIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const TabButton = ({ active, onClick, icon: Icon, label }) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
			active
				? "bg-indigo-500 text-white shadow-lg scale-105"
				: "bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10"
		}`}
	>
		<Icon className="w-5 h-5" />
		<span className="hidden sm:inline">{label}</span>
	</button>
);

const ResultCard = ({ status, message }) => (
	<div
		className={`mt-6 p-6 rounded-2xl border ${
			status === "PASS"
				? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
				: status === "FAIL"
					? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
					: "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500"
		}`}
	>
		<h3 className="text-xl font-bold mb-2">
			{status === "PASS" ? "Passed! 🎉" : status === "FAIL" ? "Failed 😔" : "Enter marks to check"}
		</h3>
		<p className="opacity-90">{message}</p>
	</div>
);

const ReappearCalculator = () => {
	const [activeTab, setActiveTab] = useState("theory");

	// Lifted States
	const [theoryMarks, setTheoryMarks] = useState({
		ca: { obt: "", max: 25 },
		mte: { obt: "", max: 20 },
		ete: { obt: "", max: 50 },
	});
	const [theoryResult, setTheoryResult] = useState(null);

	const [hybridMarks, setHybridMarks] = useState({
		ca: { obt: "", max: 30 },
		theoryMte: { obt: "", max: 20 },
		theoryEte: { obt: "", max: 30 },
		practicalEte: { obt: "", max: 20 },
	});
	const [hybridResult, setHybridResult] = useState(null);

	const [practicalMarks, setPracticalMarks] = useState({
		ca: { obt: "", max: 50 },
		ete: { obt: "", max: 50 },
	});
	const [practicalResult, setPracticalResult] = useState(null);

	// Reset Handler (resets only the active calculator)
	const reset = () => {
		if (activeTab === "theory") {
			setTheoryMarks({
				ca: { obt: "", max: 25 },
				mte: { obt: "", max: 20 },
				ete: { obt: "", max: 50 },
			});
			setTheoryResult(null);
		} else if (activeTab === "hybrid") {
			setHybridMarks({
				ca: { obt: "", max: 30 },
				theoryMte: { obt: "", max: 20 },
				theoryEte: { obt: "", max: 30 },
				practicalEte: { obt: "", max: 20 },
			});
			setHybridResult(null);
		} else if (activeTab === "practical") {
			setPracticalMarks({
				ca: { obt: "", max: 50 },
				ete: { obt: "", max: 50 },
			});
			setPracticalResult(null);
		}
	};

	return (
		<div className="flex flex-col items-center justify-start w-full min-h-[calc(100vh-80px)] p-4 md:p-5 box-border">
			{/* Header */}
			<div className="text-center mb-8 md:mb-10 relative">
				<CalculatorIcon className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-5 animate-bounce text-indigo-500" />
				<h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
					Reappear Calculator
				</h1>
				<p className="text-lg text-gray-500 mt-2">Check if you pass or fail based on your marks</p>
			</div>

			<div className="w-full max-w-2xl bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/20">
				{/* Tabs */}
				<div className="flex flex-wrap gap-2 mb-8 justify-center bg-gray-100 dark:bg-white/5 p-1 rounded-2xl">
					<TabButton
						active={activeTab === "theory"}
						onClick={() => setActiveTab("theory")}
						icon={BookOpenIcon}
						label="Theory Only"
					/>
					<TabButton
						active={activeTab === "hybrid"}
						onClick={() => setActiveTab("hybrid")}
						icon={AcademicCapIcon}
						label="Theory + Practical"
					/>
					<TabButton
						active={activeTab === "practical"}
						onClick={() => setActiveTab("practical")}
						icon={BeakerIcon}
						label="Practical Only"
					/>
				</div>

				{/* Content Based on Tab */}
				{activeTab === "theory" && (
					<TheoryCalculator
						marks={theoryMarks}
						setMarks={setTheoryMarks}
						result={theoryResult}
						setResult={setTheoryResult}
						onReset={reset}
					/>
				)}
				{activeTab === "hybrid" && (
					<HybridCalculator
						marks={hybridMarks}
						setMarks={setHybridMarks}
						result={hybridResult}
						setResult={setHybridResult}
						onReset={reset}
					/>
				)}
				{activeTab === "practical" && (
					<PracticalCalculator
						marks={practicalMarks}
						setMarks={setPracticalMarks}
						result={practicalResult}
						setResult={setPracticalResult}
						onReset={reset}
					/>
				)}
			</div>
		</div>
	);
};

// Sub-components now receive state as props
const TheoryCalculator = ({ marks, setMarks, result, setResult, onReset }) => {
	const calculate = () => {
		const caObt = parseFloat(marks.ca.obt) || 0;
		const mteObt = parseFloat(marks.mte.obt) || 0;
		const eteObt = parseFloat(marks.ete.obt) || 0;

		const caMax = parseFloat(marks.ca.max) || 25;
		const mteMax = parseFloat(marks.mte.max) || 25;
		const eteMax = parseFloat(marks.ete.max) || 50;

		const totalObt = caObt + mteObt + eteObt;
		const totalMax = caMax + mteMax + eteMax;

		const etePercent = (eteObt / eteMax) * 100;
		const combinedTheoryObt = mteObt + eteObt;
		const combinedTheoryMax = mteMax + eteMax;
		const combinedTheoryPercent = (combinedTheoryObt / combinedTheoryMax) * 100;
		const overallPercent = (totalObt / totalMax) * 100;

		// Criteria:
		// 1. Min 30% in ETE OR Min 30% in (ETE + MTE)
		const cond1 = etePercent >= 30 || combinedTheoryPercent >= 30;

		// 2. Overall marks >= 40%
		const cond2 = overallPercent >= 40;

		if (cond1 && cond2) {
			setResult({ status: "PASS", message: `Overall: ${overallPercent.toFixed(2)}%` });
		} else {
			const msg = [];
			if (!cond1) msg.push("Failed ETE/MTE criteria (<30%)");
			if (!cond2) msg.push(`Overall marks low (${overallPercent.toFixed(2)}% < 40%)`);
			setResult({ status: "FAIL", message: msg.join(" & ") });
		}
	};

	return (
		<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<MarkInput label="CA Marks" value={marks.ca} onChange={(v) => setMarks({ ...marks, ca: v })} />
				<MarkInput label="MTE Marks" value={marks.mte} onChange={(v) => setMarks({ ...marks, mte: v })} />
				<MarkInput
					label="ETE Marks"
					value={marks.ete}
					onChange={(v) => setMarks({ ...marks, ete: v })}
					fullWidth
				/>
			</div>

			<div className="flex flex-col sm:flex-row gap-3 mt-4">
				<button
					onClick={calculate}
					className="flex-1 btn-primary py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all"
				>
					Calculate Result
				</button>
				<button
					onClick={onReset}
					className="px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2"
				>
					<ArrowPathIcon className="w-5 h-5" />
					Reset
				</button>
			</div>

			{result && <ResultCard status={result.status} message={result.message} />}
		</div>
	);
};

const HybridCalculator = ({ marks, setMarks, result, setResult, onReset }) => {
	const calculate = () => {
		const caObt = parseFloat(marks.ca.obt) || 0;
		const tMteObt = parseFloat(marks.theoryMte.obt) || 0;
		const tEteObt = parseFloat(marks.theoryEte.obt) || 0;
		const pEteObt = parseFloat(marks.practicalEte.obt) || 0;

		const caMax = parseFloat(marks.ca.max);
		const tMteMax = parseFloat(marks.theoryMte.max);
		const tEteMax = parseFloat(marks.theoryEte.max);
		const pEteMax = parseFloat(marks.practicalEte.max);

		// 1. Min 30% Theory ETE OR Min 30% combined Theory (ETE+MTE)
		const tEteP = (tEteObt / tEteMax) * 100;
		const tCombinedObt = tMteObt + tEteObt;
		const tCombinedMax = tMteMax + tEteMax;
		const tCombinedP = (tCombinedObt / tCombinedMax) * 100;

		const cond1 = tEteP >= 30 || tCombinedP >= 30;

		// 2. Min 30% in End Term Practical
		const pEteP = (pEteObt / pEteMax) * 100;
		const cond2 = pEteP >= 30;

		// 3. Overall >= 40%
		const totalObt = caObt + tMteObt + tEteObt + pEteObt;
		const totalMax = caMax + tMteMax + tEteMax + pEteMax;
		const overallP = (totalObt / totalMax) * 100;
		const cond3 = overallP >= 40;

		if (cond1 && cond2 && cond3) {
			setResult({ status: "PASS", message: `Overall: ${overallP.toFixed(2)}%` });
		} else {
			const msg = [];
			if (!cond1) msg.push("Theory criteria failed");
			if (!cond2) msg.push("Practical criteria failed");
			if (!cond3) msg.push(`Overall low (${overallP.toFixed(2)}%)`);
			setResult({ status: "FAIL", message: msg.join(", ") });
		}
	};

	return (
		<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<MarkInput label="Total CA" value={marks.ca} onChange={(v) => setMarks({ ...marks, ca: v })} />
				<MarkInput
					label="Theory MTE"
					value={marks.theoryMte}
					onChange={(v) => setMarks({ ...marks, theoryMte: v })}
				/>
				<MarkInput
					label="Theory ETE"
					value={marks.theoryEte}
					onChange={(v) => setMarks({ ...marks, theoryEte: v })}
				/>
				<MarkInput
					label="Practical ETE"
					value={marks.practicalEte}
					onChange={(v) => setMarks({ ...marks, practicalEte: v })}
				/>
			</div>

			<div className="flex flex-col sm:flex-row gap-3 mt-4">
				<button
					onClick={calculate}
					className="flex-1 btn-primary py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all"
				>
					Calculate Result
				</button>
				<button
					onClick={onReset}
					className="px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2"
				>
					<ArrowPathIcon className="w-5 h-5" />
					Reset
				</button>
			</div>

			{result && <ResultCard status={result.status} message={result.message} />}
		</div>
	);
};

const PracticalCalculator = ({ marks, setMarks, result, setResult, onReset }) => {
	const calculate = () => {
		const caObt = parseFloat(marks.ca.obt) || 0;
		const eteObt = parseFloat(marks.ete.obt) || 0;
		const caMax = parseFloat(marks.ca.max);
		const eteMax = parseFloat(marks.ete.max);

		// 1. Min 30% in End Term Practical
		const eteP = (eteObt / eteMax) * 100;
		const cond1 = eteP >= 30;

		// 2. Overall >= 40%
		const totalObt = caObt + eteObt;
		const totalMax = caMax + eteMax;
		const overallP = (totalObt / totalMax) * 100;
		const cond2 = overallP >= 40;

		if (cond1 && cond2) {
			setResult({ status: "PASS", message: `Overall: ${overallP.toFixed(2)}%` });
		} else {
			const msg = [];
			if (!cond1) msg.push("In End Term Practical (<30%)");
			if (!cond2) msg.push(`Overall marks low (${overallP.toFixed(2)}%)`);
			setResult({ status: "FAIL", message: msg.join(", ") });
		}
	};

	return (
		<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<MarkInput label="CA Marks" value={marks.ca} onChange={(v) => setMarks({ ...marks, ca: v })} />
				<MarkInput
					label="End Term Practical"
					value={marks.ete}
					onChange={(v) => setMarks({ ...marks, ete: v })}
				/>
			</div>

			<div className="flex flex-col sm:flex-row gap-3 mt-4">
				<button
					onClick={calculate}
					className="flex-1 btn-primary py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all"
				>
					Calculate Result
				</button>
				<button
					onClick={onReset}
					className="px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2"
				>
					<ArrowPathIcon className="w-5 h-5" />
					Reset
				</button>
			</div>

			{result && <ResultCard status={result.status} message={result.message} />}
		</div>
	);
};

const MarkInput = ({ label, value, onChange, fullWidth }) => (
	<div className={`flex flex-col gap-2 ${fullWidth ? "col-span-1 sm:col-span-2" : ""}`}>
		<label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{label}</label>
		<div className="flex gap-2">
			<input
				type="number"
				value={value.obt}
				onChange={(e) => onChange({ ...value, obt: e.target.value })}
				placeholder="Obt"
				className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400"
			/>
			<div className="flex items-center text-gray-400">/</div>
			<input
				type="number"
				value={value.max}
				onChange={(e) => onChange({ ...value, max: e.target.value })}
				placeholder="Max"
				className="w-16 px-2 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center text-sm"
			/>
		</div>
	</div>
);

export default ReappearCalculator;
