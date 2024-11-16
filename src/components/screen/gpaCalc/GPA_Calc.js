import React, { useState } from 'react';
import './gpaCalc.css';

const GpaCalculator = () => {
	const [subjects, setSubjects] = useState([]);
	const [newSubject, setNewSubject] = useState({ subjectName: '', grade: '', credit: '' });

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewSubject({ ...newSubject, [name]: value });
	};

	const addSubject = (e) => {
		e.preventDefault();
		if (newSubject.subjectName && newSubject.grade && newSubject.credit) {
			setSubjects([
				...subjects,
				{
					subjectName: newSubject.subjectName,
					grade: parseFloat(newSubject.grade),
					credit: parseFloat(newSubject.credit),
				},
			]);
			setNewSubject({ subjectName: '', grade: '', credit: '' });
		}
	};

	const calculateGPA = () => {
		const totalPoints = subjects.reduce((acc, subject) => acc + subject.grade * subject.credit, 0);
		const totalCredits = subjects.reduce((acc, subject) => acc + subject.credit, 0);
		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
	};

	return (
		<div id="GpaCalculator">
			<h1>GPA Calculator</h1>
			<form className="input-form" onSubmit={addSubject}>
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
					<label htmlFor="grade">Grade (0-10)</label>
					<input
						id="grade"
						type="number"
						name="grade"
						placeholder='e.g. "8"'
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
						placeholder='e.g. "3"'
						min="0"
						step="0.5"
						value={newSubject.credit}
						onChange={handleInputChange}
						required
					/>
				</div>
				<button type="submit">Add Subject</button>
			</form>

			<h2>Subjects</h2>
			<div className="table-container">
				<table className="subjects-table">
					<thead>
						<tr>
							<th>Subject Name</th>
							<th>Grade</th>
							<th>Credits</th>
						</tr>
					</thead>
					<tbody>
						{subjects.map((subject, index) => (
							<tr key={index}>
								<td>{subject.subjectName}</td>
								<td>{subject.grade}</td>
								<td>{subject.credit}</td>
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
