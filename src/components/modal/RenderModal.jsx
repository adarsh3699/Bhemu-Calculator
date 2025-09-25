import BaseModal from "./BaseModal";

const modalData_1 = {
	name: "Grade Point",
	info: (
		<>
			A <b>grade point</b> is a numeric value assigned to your performance in a course based on your final grade.
			At Indian Colleges, the grading system is based on a 10-point scale, and grades correspond to specific grade
			points:
		</>
	),
	tableData: [
		{ grade: "O", gradePoint: 10, performance: "Outstanding" },
		{ grade: "A+", gradePoint: 9, performance: "Excellent" },
		{ grade: "A", gradePoint: 8, performance: "Very Good" },
		{ grade: "B+", gradePoint: 7, performance: "Good" },
		{ grade: "B", gradePoint: 6, performance: "Above Average" },
		{ grade: "C", gradePoint: 5, performance: "Average" },
		{ grade: "P", gradePoint: 4, performance: "Pass" },
		{ grade: "F", gradePoint: 0, performance: "Fail" },
		{ grade: "G", gradePoint: 0, performance: "Backlog" },
		{ grade: "E", gradePoint: 0, performance: "Reappear" },
		{ grade: "I", gradePoint: 0, performance: "Incomplete" },
	],
};

const modalData_ch = {
	name: "Credit Hours (CH)",
	info: (
		<>
			<b>Credit Hours</b> represent the weight or importance of a course. It is usually determined by the number
			of hours you spend on that course in a week. For example:
		</>
	),
	list: [
		<>
			<b>Credit Hours</b> represent the weight of that course.
		</>,
		<>
			A <b>theory</b> class might have 3 Credit Hours.
		</>,
		<>
			A <b>lab session</b> could have 1 or 2 Credit Hours.
		</>,
	],
	para2: (
		<>
			The Credit Hours of each course are predefined and available in your course{" "}
			<b>syllabus or student portal.</b>
		</>
	),
};

function RenderModal({ isModalOpen, onClose, modalType }) {
	const modalData = modalType === "ch" ? modalData_ch : modalData_1;

	const handleClose = () => {
		if (onClose) {
			onClose();
		}
	};

	// Don't render modal content if modalType is empty or undefined
	if (!modalType) {
		return null;
	}

	return (
		<BaseModal
			isOpen={isModalOpen}
			onClose={handleClose}
			title={modalData?.name?.toUpperCase()}
			maxWidth="900px"
			className="auth-card backdrop-blur-xl"
		>
			<div className="p-6 overflow-auto max-h-[calc(85vh-120px)]">
				<p className="leading-relaxed mb-5 text-lg text-main font-normal animate-in fade-in duration-500">
					{modalData?.info}
				</p>

				{modalData.tableData && (
					<table className="w-full border-collapse my-6 bg-white/5 rounded-2xl overflow-hidden shadow-lg">
						<thead className="btn-primary">
							<tr>
								<th className="px-5 py-4 text-left font-semibold text-white text-base tracking-wide uppercase">
									Grade
								</th>
								<th className="px-5 py-4 text-left font-semibold text-white text-base tracking-wide uppercase">
									Grade Point
								</th>
								<th className="px-5 py-4 text-left font-semibold text-white text-base tracking-wide uppercase">
									Performance
								</th>
							</tr>
						</thead>
						<tbody>
							{modalData?.tableData.map((data, index) => (
								<tr key={index} className="transition-all duration-300 hover:bg-white/10">
									<td className="px-5 py-4 border-b border-white/10 text-emerald-400 font-bold text-base last:border-b-0">
										{data.grade}
									</td>
									<td className="px-5 py-4 border-b border-white/10 text-indigo-400 font-semibold text-base last:border-b-0">
										{data.gradePoint}
									</td>
									<td className="px-5 py-4 border-b border-white/10 text-main text-base last:border-b-0">
										{data.performance}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}

				{modalData.list && (
					<ul className="pl-5 leading-relaxed my-5 space-y-3">
						{modalData?.list.map((data, index) => (
							<li key={index} className="text-base text-main list-disc">
								{data}
							</li>
						))}
					</ul>
				)}

				{modalData?.para2 && (
					<p className="leading-relaxed mb-5 text-lg text-main font-normal animate-in fade-in duration-500">
						{modalData?.para2}
					</p>
				)}
			</div>
		</BaseModal>
	);
}

export default RenderModal;
