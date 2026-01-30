import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

const SubjectForm = ({
	activeSemester,
	activeSemesterName,
	isReadOnlyProfile,
	onSubmit,
	formState,
	onChange,
	editIndex,
	onInfoClick,
}) => {
	if (!activeSemester) return null;

	return (
		<div className="bg-white dark:bg-white/10 backdrop-blur-[20px] rounded-3xl p-5 md:p-8 mb-6 md:mb-10 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-300 dark:border-white/20 relative w-full max-w-4xl before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gray-400 dark:before:via-white/40 before:to-transparent">
			<h3 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white/90 mb-4 md:mb-5 text-center flex items-center justify-center flex-wrap gap-2">
				{isReadOnlyProfile ? "View Subjects in " : "Add Subject to "}
				<span className="text-primary truncate max-w-[200px]">{activeSemesterName}</span>
				{isReadOnlyProfile && (
					<span className="inline-flex items-center px-3 py-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(239,68,68,0.3)] animate-fadeIn">
						Read-Only
					</span>
				)}
			</h3>
			<form onSubmit={onSubmit}>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
					<div className="flex flex-col">
						<label
							htmlFor="subjectName"
							className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-2 flex items-center gap-1"
						>
							Subject Name
						</label>
						<input
							id="subjectName"
							type="text"
							name="subjectName"
							placeholder={isReadOnlyProfile ? "Read-only profile" : 'e.g. "Mathematics"'}
							value={formState.subjectName}
							onChange={onChange}
							disabled={isReadOnlyProfile}
							required
							className="px-3 py-3 border-2 border-gray-300 dark:border-white/20 rounded-lg bg-gray-100 dark:bg-white/10 text-sm transition-all duration-300 text-gray-900 dark:text-white/90 placeholder:text-gray-600 dark:placeholder:text-white/60 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-white/10 disabled:border-gray-300 dark:disabled:border-white/20 disabled:text-gray-500 dark:disabled:text-white/50 disabled:placeholder:text-gray-400 dark:disabled:placeholder:text-white/40"
						/>
					</div>

					<div className="flex flex-col">
						<label
							htmlFor="grade"
							className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-2 flex items-center gap-1"
						>
							Grade
							<button
								type="button"
								onClick={(e) => onInfoClick("grade", e)}
								className="bg-none border-none text-gray-600 dark:text-white/60 cursor-pointer text-xs p-1 rounded transition-all duration-300 inline-flex items-center justify-center hover:text-gray-800 dark:hover:text-white/90 hover:bg-gray-200 dark:hover:bg-white/10 hover:scale-110"
							>
								<InformationCircleIcon className="w-4 h-4" />
							</button>
						</label>
						<select
							id="grade"
							name="grade"
							value={formState.grade}
							onChange={onChange}
							disabled={isReadOnlyProfile}
							required
							className="px-3 py-3 border-2 border-gray-300 dark:border-white/20 rounded-lg bg-gray-100 dark:bg-white/10 text-sm transition-all duration-300 text-gray-900 dark:text-white/90 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-white/10 disabled:border-gray-300 dark:disabled:border-white/20 disabled:text-gray-500 dark:disabled:text-white/50"
						>
							<option value="" className="text-gray-900">
								Select Grade
							</option>
							<option value="10" className="text-gray-900">
								O (10)
							</option>
							<option value="9" className="text-gray-900">
								A+ (9)
							</option>
							<option value="8" className="text-gray-900">
								A (8)
							</option>
							<option value="7" className="text-gray-900">
								B+ (7)
							</option>
							<option value="6" className="text-gray-900">
								B (6)
							</option>
							<option value="5" className="text-gray-900">
								C (5)
							</option>
							<option value="4" className="text-gray-900">
								D (4)
							</option>
							<option value="0" className="text-gray-900">
								E - Reappear (0)
							</option>
							<option value="0" className="text-gray-900">
								F - Fail (0)
							</option>
							<option value="0" className="text-gray-900">
								G - Backlog (0)
							</option>
						</select>
					</div>

					<div className="flex flex-col">
						<label
							htmlFor="credit"
							className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-2 flex items-center gap-1"
						>
							Credits
							<button
								type="button"
								onClick={(e) => onInfoClick("ch", e)}
								className="bg-none border-none text-gray-600 dark:text-white/60 cursor-pointer text-xs p-1 rounded transition-all duration-300 inline-flex items-center justify-center hover:text-gray-800 dark:hover:text-white/90 hover:bg-gray-200 dark:hover:bg-white/10 hover:scale-110"
							>
								<InformationCircleIcon className="w-4 h-4" />
							</button>
						</label>
						<input
							id="credit"
							type="number"
							name="credit"
							placeholder={isReadOnlyProfile ? "Read-only profile" : "Credits"}
							min="0"
							step="0.5"
							value={formState.credit}
							onChange={onChange}
							disabled={isReadOnlyProfile}
							required
							className="px-3 py-3 border-2 border-gray-300 dark:border-white/20 rounded-lg bg-gray-100 dark:bg-white/10 text-sm transition-all duration-300 text-gray-900 dark:text-white/90 placeholder:text-gray-600 dark:placeholder:text-white/60 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-white/10 disabled:border-gray-300 dark:disabled:border-white/20 disabled:text-gray-500 dark:disabled:text-white/50 disabled:placeholder:text-gray-400 dark:disabled:placeholder:text-white/40"
						/>
					</div>

					<div className="flex flex-col">
						<button
							type="submit"
							disabled={isReadOnlyProfile}
							className="px-6 py-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(59,130,246,0.4)] uppercase tracking-wide min-h-[42.5px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)] hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:bg-white/10 disabled:transform-none disabled:shadow-none"
						>
							{editIndex === -1 ? "Add Subject" : "Update"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default SubjectForm;
