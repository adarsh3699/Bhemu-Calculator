import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { calculateGPA } from "../../utils/gpaUtils";

const SemesterList = ({
	semesters,
	activeSemester,
	isReadOnlyProfile,
	onEditSubject,
	onDeleteSubject,
	onAddSemesterClick, // Fallback for empty state from parent
}) => {
	if (semesters.length === 0) {
		return (
			<div className="text-center py-16 text-gray-600 dark:text-white/70">
				<h3 className="text-3xl mb-3 text-gray-700 dark:text-white/80">No semesters added yet</h3>
				<p className="text-lg text-gray-500 dark:text-white/60">
					Click "Add Semester" to get started with your GPA calculation!
				</p>
			</div>
		);
	}

	return (
		<div className="w-full max-w-4xl">
			{semesters.map((semester) => (
				<div
					key={semester.id}
					className={`bg-white dark:bg-white/10 backdrop-blur-[20px] rounded-3xl p-5 md:p-8 mb-6 md:mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-300 dark:border-white/20 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gray-400 dark:before:via-white/40 before:to-transparent animate-fadeIn ${
						activeSemester === semester.id ? "block" : "hidden"
					}`}
				>
					<div className="flex flex-col lg:flex-row justify-between items-center mb-5 gap-4">
						<div className="semester-info">
							<h3 className="text-2xl font-bold text-start text-gray-800 dark:text-white/90 mb-0">
								{semester.name}
							</h3>
							<div className="flex gap-4 text-sm text-gray-600 dark:text-white/70">
								<span className="flex items-center gap-1">{semester.subjects.length} subjects</span>
								<span className="flex items-center gap-1">
									{semester.subjects.reduce((acc, subject) => acc + subject.credit, 0)} credits
								</span>
							</div>
						</div>
						<div className="flex flex-col items-center p-4 bg-gray-200 dark:bg-white/10 rounded-2xl backdrop-blur-[10px] border border-gray-300 dark:border-white/10">
							<div className="text-3xl font-bold text-gray-800 dark:text-white/90 leading-none">
								{calculateGPA(semester.subjects)}
							</div>
							<div className="text-sm text-gray-600 dark:text-white/70 mt-1">Semester GPA</div>
						</div>
					</div>

					{semester.subjects.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
							{semester.subjects.map((subject) => (
								<div
									key={subject.id}
									className="bg-gray-200 dark:bg-white/10 rounded-2xl p-6 backdrop-blur-[10px] border border-gray-300 dark:border-white/20 transition-all duration-300 hover:bg-gray-300 dark:hover:bg-white/15 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] animate-fadeIn"
								>
									<div className="flex justify-between items-center mb-4">
										<h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 text-left">
											{subject.subjectName}
										</h4>
										<div className="flex gap-2">
											<button
												className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-400/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:border-blue-300 dark:hover:border-blue-400/40 hover:scale-105 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
												onClick={() => onEditSubject(semester.id, subject)}
												disabled={isReadOnlyProfile}
												title={isReadOnlyProfile ? "Read-only profile" : "Edit subject"}
											>
												<PencilIcon className="w-4 h-4" />
											</button>
											<button
												className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 bg-red-50/80 dark:bg-red-500/10 border border-red-200/60 dark:border-red-400/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-300 dark:hover:border-red-400/40 hover:scale-105 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
												onClick={() => onDeleteSubject(semester.id, subject.id)}
												disabled={isReadOnlyProfile}
												title={isReadOnlyProfile ? "Read-only profile" : "Delete subject"}
											>
												<TrashIcon className="w-4 h-4" />
											</button>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="flex items-center gap-4">
											<span className="text-sm text-gray-600 dark:text-white/70">Grade:</span>
											<span className="text-sm font-semibold text-green-600 dark:text-green-400">
												{subject.grade}
											</span>
										</div>
										<div className="flex items-center gap-4">
											<span className="text-sm text-gray-600 dark:text-white/70">Credits:</span>
											<span className="text-sm font-semibold text-gray-800 dark:text-white/90">
												{subject.credit}
											</span>
										</div>
										<div className="flex items-center gap-4 col-span-2">
											<span className="text-sm text-gray-600 dark:text-white/70">Points:</span>
											<span className="text-sm font-semibold text-gray-800 dark:text-white/90">
												{(subject.grade * subject.credit).toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-600 dark:text-white/70">
							<h3 className="text-2xl mb-2 text-gray-700 dark:text-white/80">No subjects added yet</h3>
							<p className="text-base text-gray-500 dark:text-white/60">Add your first subject above!</p>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default SemesterList;
