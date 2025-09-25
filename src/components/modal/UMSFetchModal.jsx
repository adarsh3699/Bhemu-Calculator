import React, { useState, useEffect } from "react";
import { umsService } from "../../services/umsService";
import { ConfirmModal } from "../common";
import BaseModal from "./BaseModal";

const UMSFetchModal = ({ isOpen, onClose, onConfirm, existingData = null, profileName = "" }) => {
	const [gaValue, setGaValue] = useState("");
	const [loading, setLoading] = useState(false);
	const [fetchedData, setFetchedData] = useState(null);
	const [error, setError] = useState("");
	const [step, setStep] = useState("input"); // "input", "preview"
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	// Reset state when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setGaValue("");
			setFetchedData(null);
			setError("");
			setStep("input");
			setLoading(false);
			setShowConfirmModal(false);
		}
	}, [isOpen]);

	const handleClose = () => {
		if (onClose) {
			onClose();
		}
	};

	const fetchUMSData = async () => {
		if (!gaValue.trim()) {
			setError("Please enter your UMS session cookie");
			return;
		}

		// Validate cookie format
		const validation = umsService.validateCookie(gaValue.trim());
		if (!validation.valid) {
			setError(validation.message);
			return;
		}

		setLoading(true);
		setError("");

		try {
			// Use the UMS service to fetch data
			const data = await umsService.getStudentGrades(gaValue.trim());

			if (!data.success) {
				throw new Error(data.message || "Failed to fetch UMS data");
			}

			// Transform UMS data to our format
			const transformedData = transformUMSDataToProfile(data.data);
			setFetchedData(transformedData);
			setStep("preview");
		} catch (err) {
			console.error("Error fetching UMS data:", err);
			setError(err.message || "Failed to fetch data from UMS. Please check your connection and cookie value.");
		} finally {
			setLoading(false);
		}
	};

	const transformUMSDataToProfile = (umsData) => {
		const { studentInfo, terms = [], summary = {}, allTermIds = {} } = umsData;

		// Transform terms to semesters
		const semesters = terms.map((term, index) => ({
			id: term.id || `semester_${index + 1}`,
			name: term.displayName || `Semester ${index + 1}`,
			subjects: (term.courses || []).map((course, courseIndex) => ({
				id: `subject_${term.id}_${courseIndex}`,
				subjectName: course.courseName || course.courseCode || `Subject ${courseIndex + 1}`,
				grade: convertGradeToPoints(course.grade),
				credit: course.credits || 3, // Default to 3 credits if not provided
			})),
		}));

		// Filter out semesters with no subjects
		const validSemesters = semesters.filter((semester) => semester.subjects.length > 0);

		return {
			studentInfo: {
				vid: studentInfo?.vid || "",
				name: studentInfo?.name || "",
				program: studentInfo?.program || "",
				batchYear: studentInfo?.batchYear || "",
				cgpa: studentInfo?.cgpa || "0.00",
			},
			semesters:
				validSemesters.length > 0
					? validSemesters
					: [
							{
								id: "semester_1",
								name: "Semester 1",
								subjects: [],
							},
					  ],
			allTermIds: allTermIds || {},
			summary: summary || {},
			fetchedAt: new Date().toISOString(),
		};
	};

	const convertGradeToPoints = (grade) => {
		const gradeMap = {
			O: 10,
			"A+": 9,
			A: 8,
			"B+": 7,
			B: 6,
			C: 5,
			D: 4,
			P: 4,
			F: 0,
			G: 0,
			E: 0,
			I: 0,
		};
		return gradeMap[grade?.toUpperCase()] || 0;
	};

	const handleConfirm = () => {
		if (fetchedData && onConfirm) {
			onConfirm(fetchedData);
		}
		handleClose();
	};

	const handleOverwrite = () => {
		setShowConfirmModal(true);
	};

	const handleConfirmOverwrite = () => {
		setShowConfirmModal(false);
		if (fetchedData && onConfirm) {
			onConfirm(fetchedData);
		}
		handleClose();
	};

	const renderInputStep = () => (
		<div className="p-6">
			<div className="mb-6">
				<h3 className="text-2xl font-semibold mb-2 text-gradient">Verify Profile via UMS</h3>
				<p className="text-lighter leading-relaxed">
					Enter your UMS session cookie to automatically fetch your academic data from the university portal.
				</p>
			</div>

			<div className="mb-6">
				<label htmlFor="gaValue" className="block text-main font-semibold mb-2 text-sm">
					<strong>UMS Session Cookie (_ga_B0Z6G6GCD8)</strong>
				</label>
				<textarea
					id="gaValue"
					className="w-full min-h-20 p-3 border border-white/20 rounded-lg bg-white/5 text-white font-mono text-sm resize-y transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-white/40 disabled:opacity-50"
					placeholder="Paste your _ga_B0Z6G6GCD8 cookie value here..."
					value={gaValue}
					onChange={(e) => setGaValue(e.target.value)}
					rows={3}
					disabled={loading}
				/>
				<div className="mt-3">
					<details className="text-lighter">
						<summary className="cursor-pointer text-sm text-indigo-400 mb-2 hover:text-indigo-300 transition-colors">
							How to get your UMS session cookie?
						</summary>
						<ol className="ml-5 mt-2 text-xs leading-relaxed space-y-1 list-decimal">
							<li>
								Login to{" "}
								<a
									href="https://ums.lpu.in"
									target="_blank"
									rel="noopener noreferrer"
									className="text-indigo-400 hover:text-indigo-300 underline"
								>
									UMS Portal
								</a>
							</li>
							<li>Press F12 to open Developer Tools</li>
							<li>Go to Application/Storage → Cookies → https://ums.lpu.in</li>
							<li>
								Find and copy the value of{" "}
								<code className="bg-white/10 px-1.5 py-0.5 rounded text-white/90 font-mono">
									_ga_B0Z6G6GCD8
								</code>
							</li>
							<li>Paste the value above</li>
						</ol>
					</details>
				</div>
			</div>

			{error && (
				<div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
					<strong>Error:</strong> {error}
				</div>
			)}

			{existingData && (
				<div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
					<strong>Note:</strong> This profile already contains data. Fetching from UMS will show you a preview
					before any changes are made.
				</div>
			)}

			<div className="flex gap-3 justify-center">
				<button
					className="btn-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
					onClick={fetchUMSData}
					disabled={loading || !gaValue.trim()}
				>
					{loading ? (
						<>
							<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Fetching from UMS...
						</>
					) : (
						"Fetch Data from UMS"
					)}
				</button>
				<button
					className="btn-google px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
					onClick={handleClose}
					disabled={loading}
				>
					Cancel
				</button>
			</div>
		</div>
	);

	const renderPreviewStep = () => (
		<div className="p-6 max-h-[calc(85vh-120px)] overflow-auto">
			<div className="mb-6">
				<h3 className="text-2xl font-semibold mb-2 text-gradient">UMS Data Preview</h3>
				<p className="text-lighter leading-relaxed">
					Review the data fetched from UMS before applying it to your profile.
				</p>
			</div>

			{fetchedData && (
				<div className="space-y-6">
					{/* Student Info */}
					<div className="bg-white/5 rounded-lg p-4 border border-white/10">
						<h4 className="text-lg font-semibold mb-3 text-main">Student Information</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div className="flex justify-between items-center">
								<span className="text-lighter font-medium">Name:</span>
								<span className="text-main font-semibold">
									{fetchedData.studentInfo.name || "Not available"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-lighter font-medium">VID:</span>
								<span className="text-main font-semibold">
									{fetchedData.studentInfo.vid || "Not available"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-lighter font-medium">Program:</span>
								<span className="text-main font-semibold">
									{fetchedData.studentInfo.program || "Not available"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-lighter font-medium">CGPA:</span>
								<span className="text-emerald-400 font-bold text-lg">
									{fetchedData.studentInfo.cgpa || "0.00"}
								</span>
							</div>
						</div>
					</div>

					{/* Semesters Preview */}
					<div className="bg-white/5 rounded-lg p-4 border border-white/10">
						<h4 className="text-lg font-semibold mb-3 text-main">
							Academic Data ({fetchedData.semesters.length} semesters)
						</h4>
						<div className="space-y-3">
							{fetchedData.semesters.map((semester) => (
								<div key={semester.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
									<h5 className="font-semibold text-indigo-400 mb-2">
										{semester.name} ({semester.subjects.length} subjects)
									</h5>
									{semester.subjects.length > 0 ? (
										<div className="space-y-2">
											{semester.subjects.slice(0, 3).map((subject) => (
												<div
													key={subject.id}
													className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
												>
													<span className="text-main font-medium">{subject.subjectName}</span>
													<span className="text-emerald-400 font-semibold">
														Grade: {subject.grade}
													</span>
													<span className="text-indigo-400">Credits: {subject.credit}</span>
												</div>
											))}
											{semester.subjects.length > 3 && (
												<div className="text-sm text-lighter italic">
													... and {semester.subjects.length - 3} more subjects
												</div>
											)}
										</div>
									) : (
										<p className="text-lighter italic text-sm">
											No subjects found for this semester
										</p>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Terms Info */}
					{fetchedData.allTermIds && fetchedData.allTermIds.terms && (
						<div className="bg-white/5 rounded-lg p-4 border border-white/10">
							<h4 className="text-lg font-semibold mb-3 text-main">
								Available Terms ({fetchedData.allTermIds.totalTerms || 0})
							</h4>
							{fetchedData.allTermIds.categories && (
								<div className="flex flex-wrap gap-4 text-sm">
									<span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
										Regular: {fetchedData.allTermIds.categories.regular || 0}
									</span>
									<span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
										Reappear: {fetchedData.allTermIds.categories.reappear || 0}
									</span>
									<span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
										Backlog: {fetchedData.allTermIds.categories.backlog || 0}
									</span>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			<div className="flex flex-wrap gap-3 justify-center mt-6 pt-4 border-t border-white/10">
				{existingData ? (
					<>
						<button
							className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
							onClick={handleOverwrite}
						>
							Replace Current Data
						</button>
						<button
							className="btn-google px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
							onClick={() => setStep("input")}
						>
							Back to Input
						</button>
						<button
							className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-red-500/30 hover:scale-105"
							onClick={handleClose}
						>
							Cancel
						</button>
					</>
				) : (
					<>
						<button
							className="btn-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
							onClick={handleConfirm}
						>
							Apply This Data
						</button>
						<button
							className="btn-google px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
							onClick={() => setStep("input")}
						>
							Back to Input
						</button>
						<button
							className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-red-500/30 hover:scale-105"
							onClick={handleClose}
						>
							Cancel
						</button>
					</>
				)}
			</div>
		</div>
	);

	const renderCurrentStep = () => {
		switch (step) {
			case "input":
				return renderInputStep();
			case "preview":
				return renderPreviewStep();
			default:
				return renderInputStep();
		}
	};

	return (
		<>
			<BaseModal
				isOpen={isOpen}
				onClose={handleClose}
				title="UMS DATA VERIFICATION"
				maxWidth="900px"
				closeOnEsc={!loading}
				closeOnOverlayClick={!loading}
				className="auth-card backdrop-blur-xl"
			>
				{renderCurrentStep()}
			</BaseModal>

			<ConfirmModal
				isOpen={showConfirmModal}
				onClose={() => setShowConfirmModal(false)}
				onConfirm={handleConfirmOverwrite}
				title="Replace Profile Data"
				message={`Are you sure you want to replace all existing data in "${profileName}" with the data from UMS? This will update all semesters, subjects, and student information.`}
				confirmText="Yes, Replace Data"
				cancelText="Cancel"
				type="warning"
			/>
		</>
	);
};

export default UMSFetchModal;
