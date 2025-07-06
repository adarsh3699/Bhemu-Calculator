import React, { useCallback, useState, useEffect, useMemo } from "react";
import "../styles/gpaCalc.css";
import "react-responsive-modal/styles.css";

import { RenderModal, ProfileDrawer } from "../components/GpaCalculator";

const GpaCalculator = () => {
	const [profiles, setProfiles] = useState(() => {
		const saved = localStorage.getItem("gpaProfiles");
		return saved ? JSON.parse(saved) : [{ id: 1, name: "Default Profile", semesters: [] }];
	});

	const [activeProfile, setActiveProfile] = useState(() => {
		const saved = localStorage.getItem("activeGpaProfile");
		return saved ? parseInt(saved) : 1;
	});

	const [drawerOpen, setDrawerOpen] = useState(false);

	const [newSubject, setNewSubject] = useState({
		subjectName: "",
		grade: "",
		credit: "",
		weighted: false,
	});

	const [editIndex, setEditIndex] = useState(-1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState("grade");
	const [activeSemester, setActiveSemester] = useState(null);

	const currentProfile = profiles.find((p) => p.id === activeProfile) || profiles[0];
	const semesters = useMemo(() => currentProfile?.semesters || [], [currentProfile]);

	// Save profiles to localStorage
	const updateProfiles = useCallback((newProfiles) => {
		localStorage.setItem("gpaProfiles", JSON.stringify(newProfiles));
		setProfiles(newProfiles);
	}, []);

	// Save active profile to localStorage
	const updateActiveProfile = useCallback((profileId) => {
		localStorage.setItem("activeGpaProfile", profileId.toString());
		setActiveProfile(profileId);
		setDrawerOpen(false); // Close drawer when profile is selected
	}, []);

	// Profile management functions

	const deleteProfile = useCallback(
		(profileId) => {
			if (profiles.length <= 1) return; // Don't delete the last profile

			const updatedProfiles = profiles.filter((profile) => profile.id !== profileId);
			updateProfiles(updatedProfiles);

			if (activeProfile === profileId) {
				updateActiveProfile(updatedProfiles[0].id);
			}
		},
		[profiles, activeProfile, updateProfiles, updateActiveProfile]
	);

	// Update semester data for current profile
	const updateSemesters = useCallback(
		(newSemesters) => {
			const updatedProfiles = profiles.map((profile) =>
				profile.id === activeProfile ? { ...profile, semesters: newSemesters } : profile
			);
			updateProfiles(updatedProfiles);
		},
		[profiles, activeProfile, updateProfiles]
	);

	// Add new semester
	const addSemester = useCallback(() => {
		const newSemester = {
			id: Date.now(),
			name: `Semester ${semesters.length + 1}`,
			subjects: [],
			isWeighted: false,
		};
		updateSemesters([...semesters, newSemester]);
		setActiveSemester(newSemester.id);
	}, [semesters, updateSemesters]);

	// Delete semester
	const deleteSemester = useCallback(
		(semesterId) => {
			const updatedSemesters = semesters.filter((semester) => semester.id !== semesterId);
			updateSemesters(updatedSemesters);
			if (activeSemester === semesterId) {
				setActiveSemester(updatedSemesters.length > 0 ? updatedSemesters[0].id : null);
			}
		},
		[semesters, activeSemester, updateSemesters]
	);

	// Handle input changes
	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		setNewSubject((prev) => ({ ...prev, [name]: value }));
	}, []);

	// Add or update subject
	const addOrUpdateSubject = useCallback(
		(e) => {
			e.preventDefault();
			if (!activeSemester) return;

			const { subjectName, grade, credit } = newSubject;
			if (!subjectName || !grade || !credit) return;

			const subjectData = {
				id: editIndex === -1 ? Date.now() : editIndex,
				subjectName,
				grade: parseFloat(grade),
				credit: parseFloat(credit),
			};

			const updatedSemesters = semesters.map((semester) => {
				if (semester.id === activeSemester) {
					if (editIndex === -1) {
						return { ...semester, subjects: [...semester.subjects, subjectData] };
					} else {
						return {
							...semester,
							subjects: semester.subjects.map((subject) =>
								subject.id === editIndex ? subjectData : subject
							),
						};
					}
				}
				return semester;
			});

			updateSemesters(updatedSemesters);
			setNewSubject({ subjectName: "", grade: "", credit: "", weighted: false });
			setEditIndex(-1);
		},
		[newSubject, semesters, activeSemester, editIndex, updateSemesters]
	);

	// Edit subject
	const editSubject = useCallback((semesterId, subject) => {
		setEditIndex(subject.id);
		setActiveSemester(semesterId);
		setNewSubject({
			subjectName: subject.subjectName,
			grade: subject.grade.toString(),
			credit: subject.credit.toString(),
			weighted: subject.weighted || false,
		});
	}, []);

	// Delete subject
	const deleteSubject = useCallback(
		(semesterId, subjectId) => {
			const updatedSemesters = semesters.map((semester) => {
				if (semester.id === semesterId) {
					return {
						...semester,
						subjects: semester.subjects.filter((subject) => subject.id !== subjectId),
					};
				}
				return semester;
			});
			updateSemesters(updatedSemesters);
		},
		[semesters, updateSemesters]
	);

	// Calculate semester GPA
	const calculateSemesterGPA = useCallback((subjects) => {
		if (!subjects || subjects.length === 0) return "0.00";

		const totalPoints = subjects.reduce((acc, subject) => acc + subject.grade * subject.credit, 0);
		const totalCredits = subjects.reduce((acc, subject) => acc + subject.credit, 0);

		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
	}, []);

	// Calculate CGPA
	const calculateCGPA = useCallback(() => {
		if (!semesters || semesters.length === 0) return "0.00";

		const allSubjects = semesters.flatMap((semester) => semester.subjects);
		return calculateSemesterGPA(allSubjects);
	}, [semesters, calculateSemesterGPA]);

	// Handle modal toggle
	const handleModalToggle = useCallback((type) => {
		setModalType(type);
		setIsModalOpen(true);
	}, []);

	// Handle drawer toggle
	const toggleDrawer = useCallback(() => {
		setDrawerOpen(!drawerOpen);
	}, [drawerOpen]);

	// Set initial active semester
	useEffect(() => {
		if (semesters.length > 0 && !activeSemester) {
			setActiveSemester(semesters[0].id);
		}
	}, [semesters, activeSemester]);

	// Icon components
	const InfoIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
		</svg>
	);

	const EditIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
		</svg>
	);

	const DeleteIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
		</svg>
	);

	const PlusIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor" height="30px" width="30px">
			<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
		</svg>
	);

	const CloseIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
		</svg>
	);

	const UserIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
		</svg>
	);

	return (
		<div>
			{/* Profile Drawer */}
			<ProfileDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				profiles={profiles}
				currentProfile={activeProfile}
				onProfileSelect={updateActiveProfile}
				onCreateProfile={(name) => {
					const newProfile = {
						id: Date.now(),
						name: name,
						semesters: [],
					};
					const updatedProfiles = [...profiles, newProfile];
					updateProfiles(updatedProfiles);
					updateActiveProfile(newProfile.id);
				}}
				onDeleteProfile={deleteProfile}
			/>

			{/* Main Content */}
			<div id="GpaCalculator">
				<div className="header">
					<h1>GPA Calculator</h1>
					<p className="subtitle">Calculate your semester GPA and cumulative GPA</p>
				</div>

				{/* Profile Selection */}
				<div className="profile-selection">
					<div className="profile-selector" onClick={toggleDrawer}>
						<UserIcon />
						<span>{currentProfile?.name}</span>
					</div>
				</div>

				{/* CGPA Display */}
				<div className="cgpa-display">
					<div className="cgpa-circle">
						<div className="cgpa-value">{calculateCGPA()}</div>
						<div className="cgpa-label">Cumulative GPA</div>
					</div>
					<div className="cgpa-stats">
						<div className="stat">
							<span className="stat-value">{semesters.length}</span>
							<span className="stat-label">Semesters</span>
						</div>
						<div className="stat">
							<span className="stat-value">
								{semesters.reduce((acc, semester) => acc + semester.subjects.length, 0)}
							</span>
							<span className="stat-label">Total Subjects</span>
						</div>
						<div className="stat">
							<span className="stat-value">
								{semesters.reduce(
									(acc, semester) =>
										acc + semester.subjects.reduce((subAcc, subject) => subAcc + subject.credit, 0),
									0
								)}
							</span>
							<span className="stat-label">Total Credits</span>
						</div>
					</div>
				</div>

				{/* Semester Management */}
				<div className="semester-management">
					<div className="semester-header">
						<h2>Manage Semesters</h2>
						<button className="add-semester-btn" onClick={addSemester}>
							<PlusIcon />
							Add Semester
						</button>
					</div>

					{/* Semester Tabs */}
					{semesters.length > 0 && (
						<div className="semester-tabs">
							{semesters.map((semester) => (
								<div
									key={semester.id}
									className={`semester-tab ${activeSemester === semester.id ? "active" : ""}`}
									onClick={() => setActiveSemester(semester.id)}
								>
									<span className="semester-name">{semester.name}</span>
									<span className="semester-gpa">GPA: {calculateSemesterGPA(semester.subjects)}</span>
									<button
										className="delete-semester-btn"
										onClick={(e) => {
											e.stopPropagation();
											deleteSemester(semester.id);
										}}
									>
										<CloseIcon />
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Subject Form */}
				{activeSemester && (
					<div className="subject-form-container">
						<h3>Add Subject to {semesters.find((s) => s.id === activeSemester)?.name}</h3>
						<form className="subject-form" onSubmit={addOrUpdateSubject}>
							<div className="form-row">
								<div className="form-group">
									<label htmlFor="subjectName">Subject Name</label>
									<input
										id="subjectName"
										type="text"
										name="subjectName"
										placeholder='e.g. "Mathematics"'
										value={newSubject.subjectName}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="grade">
										Grade
										<button type="button" onClick={() => handleModalToggle("grade")}>
											<InfoIcon />
										</button>
									</label>
									<select
										id="grade"
										name="grade"
										value={newSubject.grade}
										onChange={handleInputChange}
										required
									>
										<option value="">Select Grade</option>
										<option value="10">O (10)</option>
										<option value="9">A+ (9)</option>
										<option value="8">A (8)</option>
										<option value="7">B+ (7)</option>
										<option value="6">B (6)</option>
										<option value="5">C (5)</option>
										<option value="4">D (4)</option>
										<option value="0">E - Reappear (0)</option>
										<option value="0">F - Fail (0)</option>
										<option value="0">G - Backlog (0)</option>
									</select>
								</div>

								<div className="form-group">
									<label htmlFor="credit">
										Credits
										<button type="button" onClick={() => handleModalToggle("ch")}>
											<InfoIcon />
										</button>
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

								<div className="form-group">
									<button type="submit" className="submit-btn">
										{editIndex === -1 ? "Add Subject" : "Update Subject"}
									</button>
								</div>
							</div>
						</form>
					</div>
				)}

				{/* Semester Content */}
				{semesters.length > 0 ? (
					<div className="semesters-container">
						{semesters.map((semester) => (
							<div
								key={semester.id}
								className={`semester-card ${activeSemester === semester.id ? "active" : ""}`}
								style={{ display: activeSemester === semester.id ? "block" : "none" }}
							>
								<div className="semester-card-header">
									<div className="semester-info">
										<h3>{semester.name}</h3>
										<div className="semester-meta">
											<span className="subject-count">{semester.subjects.length} subjects</span>
											<span className="total-credits">
												{semester.subjects.reduce((acc, subject) => acc + subject.credit, 0)}{" "}
												credits
											</span>
										</div>
									</div>
									<div className="semester-gpa-display">
										<div className="gpa-number">{calculateSemesterGPA(semester.subjects)}</div>
										<div className="gpa-label">Semester GPA</div>
									</div>
								</div>

								{semester.subjects.length > 0 ? (
									<div className="subjects-grid">
										{semester.subjects.map((subject) => (
											<div key={subject.id} className="subject-card">
												<div className="subject-header">
													<h4 className="subject-name">{subject.subjectName}</h4>
													<div className="subject-actions">
														<button
															className="edit-btn"
															onClick={() => editSubject(semester.id, subject)}
														>
															<EditIcon />
														</button>
														<button
															className="delete-btn"
															onClick={() => deleteSubject(semester.id, subject.id)}
														>
															<DeleteIcon />
														</button>
													</div>
												</div>
												<div className="subject-details">
													<div className="detail-item">
														<span className="detail-label">Grade:</span>
														<span className="detail-value grade-value">
															{subject.grade}
														</span>
													</div>
													<div className="detail-item">
														<span className="detail-label">Credits:</span>
														<span className="detail-value">{subject.credit}</span>
													</div>
													<div className="detail-item">
														<span className="detail-label">Points:</span>
														<span className="detail-value">
															{(subject.grade * subject.credit).toFixed(2)}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="no-subjects">
										<h3>No subjects added yet</h3>
										<p>Add your first subject above!</p>
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="no-semesters">
						<h3>No semesters added yet</h3>
						<p>Click "Add Semester" to get started with your GPA calculation!</p>
					</div>
				)}

				<RenderModal modalType={modalType} isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
			</div>
		</div>
	);
};

export default GpaCalculator;
