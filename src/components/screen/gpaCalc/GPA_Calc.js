import React, { useCallback, useState } from 'react';
import './gpaCalc.css';

const GpaCalculator = () => {
	const [subjects, setSubjects] = useState([]);
	const [newSubject, setNewSubject] = useState({ subjectName: '', grade: '', credit: '' });
	const [editIndex, setEditIndex] = useState(-1);

	const handleInputChange = useCallback(
		(e) => {
			const { name, value } = e.target;
			setNewSubject({ ...newSubject, [name]: value });
		},
		[newSubject]
	);

	const addOrUpdateSubject = useCallback(
		(e) => {
			e.preventDefault();
			if (newSubject.subjectName && newSubject.grade && newSubject.credit) {
				if (editIndex === -1) {
					setSubjects([
						...subjects,
						{
							subjectName: newSubject.subjectName,
							grade: parseFloat(newSubject.grade),
							credit: parseFloat(newSubject.credit),
						},
					]);
				} else {
					const updatedSubjects = [...subjects];
					updatedSubjects[editIndex] = {
						subjectName: newSubject.subjectName,
						grade: parseFloat(newSubject.grade),
						credit: parseFloat(newSubject.credit),
					};
					setSubjects(updatedSubjects);
					setEditIndex(-1);
				}
				setNewSubject({ subjectName: '', grade: '', credit: '' });
			}
		},
		[editIndex, newSubject, subjects]
	);

	const editSubject = useCallback(
		(index) => {
			setEditIndex(index);
			setNewSubject(subjects[index]);
		},
		[subjects]
	);

	const deleteSubject = useCallback(
		(index) => {
			setSubjects(subjects.filter((_, i) => i !== index));
		},
		[subjects]
	);

	const calculateGPA = useCallback(() => {
		const totalPoints = subjects.reduce((acc, subject) => acc + subject.grade * subject.credit, 0);
		const totalCredits = subjects.reduce((acc, subject) => acc + subject.credit, 0);
		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
	}, [subjects]);

	return (
		<div id="GpaCalculator">
			<h1>GPA Calculator</h1>
			<form className="input-form" onSubmit={addOrUpdateSubject}>
				<div className="form-group">
					<label htmlFor="subjectName">Subject</label>
					<input
						id="subjectName"
						type="text"
						name="subjectName"
						placeholder='e.g. "Maths"'
						value={newSubject.subjectName}
						onChange={handleInputChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="grade">Grade</label>
					<input
						id="grade"
						type="number"
						name="grade"
						placeholder="Grade (0-10)"
						min="0"
						max="10"
						step="1"
						value={newSubject.grade}
						onChange={handleInputChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="credit">Credit Hours</label>
					<input
						id="credit"
						type="number"
						name="credit"
						placeholder="Credits"
						min="0"
						step="0.5"
						value={newSubject.credit}
						onChange={handleInputChange}
						required
					/>
				</div>
				<button type="submit">{editIndex === -1 ? 'Add Subject' : 'Edit Subject'}</button>
			</form>

			<h2>Subjects</h2>
			<div className="table-container">
				<table className="subjects-table">
					<thead>
						<tr>
							<th>Subject Name</th>
							<th>Grade</th>
							<th>Credits</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{subjects.map((subject, index) => (
							<tr key={index}>
								<td>{subject.subjectName}</td>
								<td>{subject.grade}</td>
								<td>{subject.credit}</td>
								<td>
									<button onClick={() => editSubject(index)} className="btn edit-btn">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											className="icon"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</button>
									<button onClick={() => deleteSubject(index)} className="btn delete-btn">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											className="icon"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="gpa-result">
				Calculated GPA: <span>{calculateGPA()}</span>
			</div>
		</div>
	);
};

export default GpaCalculator;
