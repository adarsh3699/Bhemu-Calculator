import React, { useCallback, useState } from 'react';
import './gpaCalc.css';
import 'react-responsive-modal/styles.css';

import RenderModal from '../../modal/RenderModal';

const localData = localStorage.getItem('subjects') ? JSON.parse(localStorage.getItem('subjects')) : [];

const GpaCalculator = () => {
	const [subjects, setSubjects] = useState(localData);
	const [newSubject, setNewSubject] = useState({ subjectName: '', grade: '', credit: '' });
	const [editIndex, setEditIndex] = useState(-1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setmodalType] = useState('grade');

	const updateLocalStorage = useCallback((data) => {
		localStorage.setItem('subjects', JSON.stringify(data));
	}, []);

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
					const temp = [
						...subjects,
						{
							subjectName: newSubject.subjectName,
							grade: parseFloat(newSubject.grade),
							credit: parseFloat(newSubject.credit),
						},
					];
					setSubjects(temp);
					updateLocalStorage(temp);
				} else {
					const updatedSubjects = [...subjects];
					updatedSubjects[editIndex] = {
						subjectName: newSubject.subjectName,
						grade: parseFloat(newSubject.grade),
						credit: parseFloat(newSubject.credit),
					};
					setSubjects(updatedSubjects);
					updateLocalStorage(updatedSubjects);
					setEditIndex(-1);
				}
				setNewSubject({ subjectName: '', grade: '', credit: '' });
			}
		},
		[editIndex, newSubject, subjects, updateLocalStorage]
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
			const temp = subjects.filter((_, i) => i !== index);
			setSubjects(temp);
			updateLocalStorage(temp);
		},
		[subjects, updateLocalStorage]
	);

	const calculateGPA = useCallback(() => {
		const totalPoints = subjects.reduce((acc, subject) => acc + subject.grade * subject.credit, 0);
		const totalCredits = subjects.reduce((acc, subject) => acc + subject.credit, 0);
		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
	}, [subjects]);

	const handleModalToggle = useCallback((name) => {
		setmodalType(name);
		setIsModalOpen((prev) => !prev);
	}, []);

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
					<label htmlFor="grade">
						Grade
						<svg
							onClick={() => handleModalToggle('grade')}
							fill="white"
							className="iBtn"
							width="20px"
							height="20px"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
							<g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
							<g id="SVGRepo_iconCarrier">
								<path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm1,15a1,1,0,0,1-2,0V11a1,1,0,0,1,2,0ZM12,8a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,12,8Z"></path>
							</g>
						</svg>
					</label>
					<input
						id="grade"
						type="number"
						name="grade"
						placeholder="Grade (0-10)"
						min="0"
						max="10"
						value={newSubject.grade}
						onChange={handleInputChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="credit">
						Credit Hours
						<svg
							onClick={() => handleModalToggle('ch')}
							className="iBtn"
							fill="white"
							width="20px"
							height="20px"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
							<g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
							<g id="SVGRepo_iconCarrier">
								<path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm1,15a1,1,0,0,1-2,0V11a1,1,0,0,1,2,0ZM12,8a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,12,8Z"></path>
							</g>
						</svg>
					</label>
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
			{isModalOpen && (
				<RenderModal
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					handleModalToggle={handleModalToggle}
					modalType={modalType}
				/>
			)}
		</div>
	);
};

export default GpaCalculator;
