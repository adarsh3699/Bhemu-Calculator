import React, { useCallback, useState, useEffect } from "react";

import RenderModal from "../components/modal/RenderModal";
import ProfileDrawer from "../components/ProfileDrawer/ProfileDrawer";
import UpdateSubjectModal from "../components/GpaCalculator/UpdateSubjectModal";
import LoginRecommendation from "../components/common/LoginRecommendation/LoginRecommendation";
import ShareModal from "../components/modal/ShareModal";
import ConfirmModal from "../components/modal/ConfirmModal";
import { useAuth } from "../firebase/AuthContext";
import { PlusIcon, XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import { useGpaData } from "../hooks/useGpaData";
import { calculateCGPA, calculateGPA } from "../utils/gpaUtils";
import SubjectForm from "../components/GpaCalculator/SubjectForm";
import SemesterList from "../components/GpaCalculator/SemesterList";

const GpaCalculator = () => {
	const { currentUser } = useAuth();

	// Custom Hook for Data Management
	const {
		profiles,
		activeProfile,
		loading,
		saving,
		sharedProfiles,
		mySharedProfiles,
		allProfiles,
		currentProfile,
		semesters,
		isReadOnlyProfile,
		updateActiveProfile,
		createProfile,
		deleteProfile,
		updateSemesters,
		shareProfileWithUser,
		unshareProfile,
		copySharedProfile,
		verifyUMS,
	} = useGpaData();

	// ===== UI STATE MANAGEMENT =====
	const [drawerOpen, setDrawerOpen] = useState(false);

	// Subject form state
	const [newSubject, setNewSubject] = useState({
		subjectName: "",
		grade: "",
		credit: "",
	});
	const [editIndex, setEditIndex] = useState(-1);
	const [activeSemester, setActiveSemester] = useState(null);

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [modalType, setModalType] = useState("");

	// Share modal state
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [profileToShare, setProfileToShare] = useState(null);

	// Semester delete confirmation state
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [semesterToDelete, setSemesterToDelete] = useState(null);

	// ===== UTILITY FUNCTIONS (UI ONLY) =====
	const handleShareProfile = useCallback(
		(profileId) => {
			const profile = profiles.find((p) => p.id === profileId);
			if (profile) {
				setProfileToShare(profile);
				setIsShareModalOpen(true);
			}
		},
		[profiles]
	);

	const handleShareWithUser = useCallback(
		async (emailOrAction, permission, action = "share") => {
			await shareProfileWithUser(profileToShare, emailOrAction, permission, action);
		},
		[shareProfileWithUser, profileToShare]
	);

	// ===== SEMESTER MANAGEMENT =====
	const addSemester = useCallback(async () => {
		const newSemester = {
			id: Date.now().toString(), // Convert to string for consistency
			name: `Semester ${semesters.length + 1}`,
			subjects: [],
		};
		await updateSemesters([...semesters, newSemester]);
		setActiveSemester(newSemester.id);
	}, [semesters, updateSemesters]);

	const deleteSemester = useCallback(
		(semesterId) => {
			const updatedSemesters = semesters.filter((semester) => semester.id !== semesterId);
			updateSemesters(updatedSemesters);
			if (activeSemester === semesterId) {
				setActiveSemester(
					updatedSemesters.length > 0 ? updatedSemesters[updatedSemesters.length - 1].id : null
				);
			}
		},
		[semesters, activeSemester, updateSemesters]
	);

	// Handle semester delete confirmation
	const handleDeleteSemesterClick = useCallback((semesterId, semesterName) => {
		setSemesterToDelete({ id: semesterId, name: semesterName });
		setShowDeleteConfirm(true);
	}, []);

	const handleConfirmDeleteSemester = useCallback(() => {
		if (semesterToDelete) {
			deleteSemester(semesterToDelete.id);
			setSemesterToDelete(null);
		}
		setShowDeleteConfirm(false);
	}, [semesterToDelete, deleteSemester]);

	const handleCancelDeleteSemester = useCallback(() => {
		setSemesterToDelete(null);
		setShowDeleteConfirm(false);
	}, []);

	// ===== SUBJECT MANAGEMENT =====
	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		setNewSubject((prev) => ({ ...prev, [name]: value }));
	}, []);

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
			setNewSubject({ subjectName: "", grade: "", credit: "" });
			setEditIndex(-1);
			setIsUpdateModalOpen(false); // Close edit modal
		},
		[newSubject, semesters, activeSemester, editIndex, updateSemesters]
	);

	const editSubject = useCallback((semesterId, subject) => {
		setEditIndex(subject.id);
		setActiveSemester(semesterId);
		setNewSubject({
			subjectName: subject.subjectName,
			grade: subject.grade.toString(),
			credit: subject.credit.toString(),
		});
		setIsUpdateModalOpen(true); // Open edit modal
	}, []);

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

	// ===== UI HANDLERS =====
	const handleModalToggle = useCallback((type, event) => {
		event.stopPropagation();
		event.preventDefault();
		setModalType(type);
		setIsModalOpen(true);
	}, []);

	const handleModalClose = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	const toggleDrawer = useCallback(() => {
		setDrawerOpen(!drawerOpen);
	}, [drawerOpen]);

	const handleUpdateActiveProfile = useCallback(
		(id) => {
			updateActiveProfile(id);
			setDrawerOpen(false);
		},
		[updateActiveProfile]
	);

	// Set initial active semester - always select the last semester
	useEffect(() => {
		if (semesters.length > 0) {
			const lastSemester = semesters[semesters.length - 1];
			// If no active semester or current active semester doesn't exist in current semesters
			if (!activeSemester || !semesters.find((s) => s.id === activeSemester)) {
				setActiveSemester(lastSemester.id);
			}
		}
	}, [semesters, activeSemester]);

	// Always select the last semester when profile changes
	useEffect(() => {
		if (semesters.length > 0) {
			const lastSemester = semesters[semesters.length - 1];
			setActiveSemester(lastSemester.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentProfile?.id]);

	// ===== RENDER =====
	if (!currentUser) {
		return <LoginRecommendation feature="GPA Calculator" />;
	}

	if (loading) {
		return (
			<div className="w-full flex flex-col items-center justify-center gap-5 py-20 text-light">
				<div className="w-12 h-12 border-3 border-gray-300 dark:border-white/30 border-t-primary rounded-full animate-spin"></div>
				<p className="text-xl font-medium text-light">Loading your GPA data...</p>
			</div>
		);
	}

	return (
		<>
			<ProfileDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				profiles={allProfiles}
				currentProfile={activeProfile}
				onProfileSelect={handleUpdateActiveProfile}
				onCreateProfile={createProfile}
				onDeleteProfile={deleteProfile}
				onShareProfile={handleShareProfile}
				onUnshareProfile={unshareProfile}
				onCopySharedProfile={copySharedProfile}
				onVerifyUMS={verifyUMS}
				sharedProfiles={sharedProfiles}
				mySharedProfiles={mySharedProfiles}
				isLoading={saving}
				currentUser={currentUser}
			/>

			<ShareModal
				isOpen={isShareModalOpen}
				onClose={() => {
					setIsShareModalOpen(false);
					setTimeout(() => {
						setProfileToShare(null);
					}, 300);
				}}
				onShareWithUser={handleShareWithUser}
				profileName={profileToShare?.name}
				currentShares={mySharedProfiles.filter((share) => share.profileId === profileToShare?.id)}
			/>

			<RenderModal modalType={modalType} isModalOpen={isModalOpen} onClose={handleModalClose} />

			<UpdateSubjectModal
				isOpen={isUpdateModalOpen}
				onClose={() => {
					setIsUpdateModalOpen(false);
					setEditIndex(-1);
					setNewSubject({ subjectName: "", grade: "", credit: "" });
				}}
				onUpdate={addOrUpdateSubject}
				subject={newSubject}
				setSubject={setNewSubject}
				isReadOnly={isReadOnlyProfile}
				onInfoClick={handleModalToggle}
			/>

			<ConfirmModal
				isOpen={showDeleteConfirm}
				onClose={handleCancelDeleteSemester}
				onConfirm={handleConfirmDeleteSemester}
				title="Delete Semester"
				message={
					semesterToDelete
						? `Are you sure you want to delete "${semesterToDelete.name}"? This action cannot be undone and will permanently remove all subjects in this semester.`
						: "Are you sure you want to delete this semester?"
				}
				confirmText="Delete"
				cancelText="Cancel"
				type="danger"
			/>

			<div className="w-full font-inter bg-transparent flex flex-col items-center justify-start text-center transition-all duration-300 px-4 sm:px-6">
				{/* Header */}
				<div className="text-center mb-6 md:mb-10 relative">
					<h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2 md:mb-3 mt-6 md:mt-10 tracking-tight">
						GPA Calculator
					</h1>
					<p className="text-base md:text-lg text-light font-normal">
						Calculate your semester GPA and cumulative GPA
					</p>
				</div>

				{/* Profile Selection */}
				<div className="mb-6 md:mb-8 flex items-center justify-center gap-4">
					<div
						className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 bg-white/90 dark:bg-white/10 backdrop-blur-[20px] rounded-2xl text-gray-700 dark:text-white/95 font-semibold text-base md:text-lg shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/20 cursor-pointer transition-all duration-300 relative overflow-hidden min-w-[160px] md:min-w-[180px] justify-center hover:bg-white dark:hover:bg-white/15 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] active:translate-y-0 active:scale-[1.01] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-gray-200/50 dark:before:via-white/20 before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
						onClick={toggleDrawer}
					>
						<UserIcon className="w-5 h-5 md:w-6 md:h-6 text-primary drop-shadow-[0_2px_4px_rgba(102,126,234,0.3)] transition-all duration-300 hover:text-primary-hover hover:scale-110 hover:drop-shadow-[0_4px_8px_rgba(102,126,234,0.4)]" />
						<span className="bg-gradient-to-br from-gray-800 to-gray-600 dark:from-white/95 dark:to-white/80 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] truncate max-w-[200px]">
							{currentProfile?.name}
						</span>
					</div>
				</div>

				{/* CGPA Display */}
				<div className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-12 mb-8 md:mb-10 p-5 md:p-8 w-full max-w-4xl bg-white dark:bg-white/10 backdrop-blur-[20px] rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-300 dark:border-white/20 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gray-400 dark:before:via-white/40 before:to-transparent">
					<div className="flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-[0_10px_30px_rgba(102,126,234,0.3)] relative group cursor-pointer transition-transform hover:scale-105">
						<div className="text-2xl md:text-3xl font-bold text-white leading-none">
							{calculateCGPA(semesters)}
						</div>
						<div className="text-xs md:text-sm text-white/90 mt-1">Cumulative GPA</div>
					</div>
					<div className="flex flex-row gap-3 sm:gap-8 flex-wrap justify-center">
						<div className="flex flex-col items-center p-3 md:p-4 bg-gray-200 dark:bg-white/10 rounded-2xl min-w-[70px] md:min-w-[80px] backdrop-blur-[10px] border border-gray-300 dark:border-white/10">
							<span className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90 leading-none">
								{semesters.length}
							</span>
							<span className="text-xs md:text-sm text-gray-600 dark:text-white/70 mt-1 text-center">
								Semesters
							</span>
						</div>
						<div className="flex flex-col items-center p-3 md:p-4 bg-gray-200 dark:bg-white/10 rounded-2xl min-w-[70px] md:min-w-[80px] backdrop-blur-[10px] border border-gray-300 dark:border-white/10">
							<span className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90 leading-none">
								{semesters.reduce((acc, semester) => acc + semester.subjects.length, 0)}
							</span>
							<span className="text-xs md:text-sm text-gray-600 dark:text-white/70 mt-1 text-center">
								Subjects
							</span>
						</div>
						<div className="flex flex-col items-center p-3 md:p-4 bg-gray-200 dark:bg-white/10 rounded-2xl min-w-[70px] md:min-w-[80px] backdrop-blur-[10px] border border-gray-300 dark:border-white/10">
							<span className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90 leading-none">
								{semesters.reduce(
									(acc, semester) =>
										acc + semester.subjects.reduce((subAcc, subject) => subAcc + subject.credit, 0),
									0
								)}
							</span>
							<span className="text-xs md:text-sm text-gray-600 dark:text-white/70 mt-1 text-center">
								Credits
							</span>
						</div>
					</div>
				</div>

				{/* Save Status */}
				{saving && (
					<div className="w-full max-w-4xl mb-5 flex justify-center">
						<div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary/10 border border-primary/30 text-primary/90">
							<div className="w-4 h-4 border-2 border-primary/30 border-t-primary/90 rounded-full animate-spin"></div>
							<span>Saving...</span>
						</div>
					</div>
				)}

				{/* Semester Management */}
				<div className="mb-8 md:mb-10 w-full max-w-4xl">
					<div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
						<h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white/90">
							{isReadOnlyProfile ? "View Semesters" : "Manage Semesters"}
						</h2>
						<button
							className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-br from-green-500 to-green-600 text-white border-none rounded-xl text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(16,185,129,0.3)] uppercase tracking-wide hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-white/10 disabled:transform-none disabled:shadow-none w-full sm:w-auto justify-center"
							onClick={addSemester}
							disabled={isReadOnlyProfile}
						>
							<PlusIcon className="w-5 h-5" />
							{isReadOnlyProfile ? "Read-Only Profile" : "Add Semester"}
						</button>
					</div>

					{/* Semester Tabs */}
					{semesters.length > 0 && (
						<div className="flex gap-3 md:gap-4 mb-4 md:mb-8 overflow-x-auto py-4 w-full justify-start md:flex-wrap no-scrollbar">
							{semesters.map((semester) => (
								<div
									key={semester.id}
									className={`flex flex-col items-center px-4 md:px-5 py-3 md:py-4 bg-gray-100 dark:bg-white/10 backdrop-blur-[10px] rounded-2xl cursor-pointer transition-all duration-300 border-2 relative min-w-[120px] flex-shrink-0 ${
										activeSemester === semester.id
											? "bg-gradient-to-br from-blue-600 to-purple-600 border-blue-600 text-white shadow-lg scale-105"
											: "border-gray-200 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/15 hover:-translate-y-0.5"
									}`}
									onClick={() => setActiveSemester(semester.id)}
								>
									<span
										className={`text-sm md:text-base font-semibold mb-1 ${
											activeSemester === semester.id
												? "text-white"
												: "text-gray-800 dark:text-white/90"
										}`}
									>
										{semester.name}
									</span>
									<span
										className={`text-xs md:text-sm ${
											activeSemester === semester.id
												? "text-white/90"
												: "text-gray-600 dark:text-white/70"
										}`}
									>
										GPA: {calculateGPA(semester.subjects)}
									</span>
									<button
										className={`absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white border-none rounded-full cursor-pointer flex items-center justify-center text-xs transition-all duration-300 shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:scale-110 ${
											activeSemester === semester.id
												? "opacity-100"
												: "opacity-0 md:group-hover:opacity-100"
										}`}
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteSemesterClick(semester.id, semester.name);
										}}
										disabled={isReadOnlyProfile}
										title={isReadOnlyProfile ? "Read-only profile" : "Delete semester"}
									>
										<XMarkIcon className="w-3 h-3" />
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Subject Form */}
				<SubjectForm
					activeSemester={activeSemester}
					activeSemesterName={semesters.find((s) => s.id === activeSemester)?.name}
					isReadOnlyProfile={isReadOnlyProfile}
					onSubmit={addOrUpdateSubject}
					formState={newSubject}
					onChange={handleInputChange}
					editIndex={editIndex}
					onInfoClick={handleModalToggle}
				/>

				{/* Semester Content */}
				<SemesterList
					semesters={semesters}
					activeSemester={activeSemester}
					isReadOnlyProfile={isReadOnlyProfile}
					onEditSubject={editSubject}
					onDeleteSubject={deleteSubject}
					onAddSemesterClick={addSemester}
				/>
			</div>
		</>
	);
};

export default GpaCalculator;
