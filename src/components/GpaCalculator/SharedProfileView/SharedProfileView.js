import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createGPAService } from "../../../firebase/gpaService";
import { useAuth } from "../../../firebase/AuthContext";
import { useMessage } from "../../common";
import "./SharedProfileView.css";

const SharedProfileView = () => {
	const { shareId } = useParams();
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const { showMessage } = useMessage();

	const [sharedProfile, setSharedProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [copying, setCopying] = useState(false);

	// Load shared profile
	useEffect(() => {
		const loadSharedProfile = async () => {
			if (!shareId) return;

			setLoading(true);
			try {
				// Create a temporary service to get shared profile
				const tempService = createGPAService("temp");
				const result = await tempService.getSharedProfile(shareId);

				if (result.success) {
					setSharedProfile(result.sharedProfile);
					setError(null);
				} else {
					setError(result.error || "Shared profile not found");
				}
			} catch (err) {
				console.error("Error loading shared profile:", err);
				setError("Error loading shared profile");
			} finally {
				setLoading(false);
			}
		};

		loadSharedProfile();
	}, [shareId]);

	// Copy profile to user's account
	const copyProfileToMyAccount = useCallback(async () => {
		if (!currentUser || !sharedProfile) {
			showMessage("Please log in to copy this profile", "warning");
			return;
		}

		setCopying(true);
		try {
			const gpaService = createGPAService(currentUser.uid);
			const result = await gpaService.copySharedProfile(shareId, `Copy of ${sharedProfile.name}`);

			if (result.success) {
				showMessage("Profile copied to your account successfully!", "success");
				navigate("/gpa-calculator");
			} else {
				showMessage(result.error || "Error copying profile", "error");
			}
		} catch (error) {
			console.error("Error copying profile:", error);
			showMessage("Error copying profile. Please try again.", "error");
		} finally {
			setCopying(false);
		}
	}, [currentUser, sharedProfile, shareId, showMessage, navigate]);

	// Calculate semester GPA
	const calculateSemesterGPA = useCallback((subjects) => {
		if (!subjects || subjects.length === 0) return "0.00";
		const totalPoints = subjects.reduce((acc, subject) => acc + subject.grade * subject.credit, 0);
		const totalCredits = subjects.reduce((acc, subject) => acc + subject.credit, 0);
		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
	}, []);

	// Calculate CGPA
	const calculateCGPA = useCallback(() => {
		if (!sharedProfile?.semesters || sharedProfile.semesters.length === 0) return "0.00";
		const allSubjects = sharedProfile.semesters.flatMap((semester) => semester.subjects);
		return calculateSemesterGPA(allSubjects);
	}, [sharedProfile, calculateSemesterGPA]);

	if (loading) {
		return (
			<div className="shared-profile-loading">
				<div className="loading-spinner"></div>
				<p>Loading shared profile...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="shared-profile-error">
				<div className="error-icon">❌</div>
				<h2>Profile Not Found</h2>
				<p>{error}</p>
				<button onClick={() => navigate("/gpa-calculator")} className="back-btn">
					← Back to GPA Calculator
				</button>
			</div>
		);
	}

	if (!sharedProfile) {
		return (
			<div className="shared-profile-error">
				<div className="error-icon">❌</div>
				<h2>Profile Not Found</h2>
				<p>The shared profile you're looking for doesn't exist or has been removed.</p>
				<button onClick={() => navigate("/gpa-calculator")} className="back-btn">
					← Back to GPA Calculator
				</button>
			</div>
		);
	}

	const semesters = sharedProfile.semesters || [];
	const cgpa = calculateCGPA();
	const totalSubjects = semesters.reduce((acc, semester) => acc + semester.subjects.length, 0);
	const totalCredits = semesters.reduce(
		(acc, semester) => acc + semester.subjects.reduce((subAcc, subject) => subAcc + subject.credit, 0),
		0
	);

	return (
		<div className="shared-profile-view">
			<div className="shared-profile-header">
				<div className="profile-info">
					<h1>{sharedProfile.name}</h1>
					<p className="shared-by">Shared by: {sharedProfile.originalUserId?.substring(0, 8)}...</p>
					<div className="share-badge">
						<span className="share-icon">🔗</span>
						Read-Only Profile
					</div>
				</div>

				<div className="profile-actions">
					{currentUser && sharedProfile.shareOptions?.allowCopy && (
						<button onClick={copyProfileToMyAccount} disabled={copying} className="copy-profile-btn">
							{copying ? "Copying..." : "📋 Copy to My Account"}
						</button>
					)}
					<button onClick={() => navigate("/gpa-calculator")} className="back-btn">
						← Back to Calculator
					</button>
				</div>
			</div>

			{/* CGPA Display */}
			<div className="cgpa-display">
				<div className="cgpa-circle">
					<div className="cgpa-value">{cgpa}</div>
					<div className="cgpa-label">Cumulative GPA</div>
				</div>
				<div className="cgpa-stats">
					<div className="stat">
						<span className="stat-value">{semesters.length}</span>
						<span className="stat-label">Semesters</span>
					</div>
					<div className="stat">
						<span className="stat-value">{totalSubjects}</span>
						<span className="stat-label">Total Subjects</span>
					</div>
					<div className="stat">
						<span className="stat-value">{totalCredits}</span>
						<span className="stat-label">Total Credits</span>
					</div>
				</div>
			</div>

			{/* Semesters */}
			<div className="semesters-container">
				{semesters.map((semester, index) => (
					<div key={semester.id || index} className="semester-card">
						<div className="semester-card-header">
							<div className="semester-info">
								<h3>{semester.name}</h3>
								<div className="semester-meta">
									<span className="subject-count">{semester.subjects.length} subjects</span>
									<span className="total-credits">
										{semester.subjects.reduce((acc, subject) => acc + subject.credit, 0)} credits
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
								{semester.subjects.map((subject, subIndex) => (
									<div key={subject.id || subIndex} className="subject-card">
										<div className="subject-header">
											<h4 className="subject-name">{subject.subjectName}</h4>
										</div>
										<div className="subject-details">
											<div className="detail-item">
												<span className="detail-label">Grade:</span>
												<span className="detail-value grade-value">{subject.grade}</span>
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
								<p>No subjects in this semester</p>
							</div>
						)}
					</div>
				))}
			</div>

			{semesters.length === 0 && (
				<div className="no-semesters">
					<h3>No semesters to display</h3>
					<p>This profile doesn't have any semester data.</p>
				</div>
			)}
		</div>
	);
};

export default SharedProfileView;
