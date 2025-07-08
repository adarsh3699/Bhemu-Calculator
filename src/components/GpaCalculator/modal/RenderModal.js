import { Modal } from "react-responsive-modal";
import { ModalCloseIcon } from "../../../assets/icons";
import "./renderModal.css";

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
		<Modal open={isModalOpen} onClose={handleClose} classNames="modal" center showCloseIcon={false}>
			<div className="modal-bar">
				<a href={modalData?.url} className="modalTile" target="_blank" rel="noreferrer">
					{modalData?.name?.toUpperCase()}
				</a>

				<span className="closeBtn" onClick={handleClose}>
					<ModalCloseIcon />
				</span>
			</div>
			<div className="modal-content">
				<p className="modalInfo">{modalData?.info}</p>

				{modalData.tableData && (
					<table className="subjects-table">
						<thead>
							<tr>
								<th>Grade</th>
								<th>Grade Point</th>
								<th>Performance</th>
							</tr>
						</thead>
						<tbody>
							{modalData?.tableData.map((data, index) => (
								<tr key={index}>
									<td>{data.grade}</td>
									<td>{data.gradePoint}</td>
									<td>{data.performance}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}

				{modalData.list && (
					<ul className="modalList">
						{modalData?.list.map((data, index) => (
							<li key={index}>{data}</li>
						))}
					</ul>
				)}

				{modalData?.para2 && <p className="modalInfo">{modalData?.para2}</p>}
			</div>
		</Modal>
	);
}

export default RenderModal;
