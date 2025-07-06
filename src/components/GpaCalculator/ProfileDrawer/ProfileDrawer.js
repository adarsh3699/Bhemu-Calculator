import React, { useState } from "react";
import "./ProfileDrawer.css";
import { InputModal, ConfirmModal } from "../../common";

const ProfileDrawer = ({
	isOpen,
	onClose,
	profiles,
	currentProfile,
	onProfileSelect,
	onCreateProfile,
	onDeleteProfile,
}) => {
	const [showInputModal, setShowInputModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [profileToDelete, setProfileToDelete] = useState(null);

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleCreateProfile = () => {
		setShowInputModal(true);
	};

	const handleProfileNameSubmit = (name) => {
		onCreateProfile(name);
		setShowInputModal(false);
		onClose();
	};

	const handleDeleteProfile = (profileId, profileName) => {
		setProfileToDelete({ id: profileId, name: profileName });
		setShowConfirmModal(true);
	};

	const handleConfirmDelete = () => {
		if (profileToDelete) {
			onDeleteProfile(profileToDelete.id);
			setProfileToDelete(null);
		}
		setShowConfirmModal(false);
	};

	return (
		<>
			{isOpen && (
				<div className="profile-drawer-overlay" onClick={handleOverlayClick}>
					<div className="profile-drawer">
						<div className="profile-drawer-handle"></div>
						<div className="profile-drawer-content">
							<h3>Select Profile</h3>
							<div className="profile-grid">
								{profiles.map((profile) => (
									<div
										key={profile.id}
										className={`profile-card ${currentProfile === profile.id ? "active" : ""}`}
										onClick={() => {
											onProfileSelect(profile.id);
											onClose();
										}}
									>
										<div className="profile-info">
											<h4>{profile.name}</h4>
											<p>
												{profile.semesters.length} semester
												{profile.semesters.length !== 1 ? "s" : ""}
											</p>
										</div>
										{profiles.length > 1 && (
											<button
												className="delete-profile-btn"
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteProfile(profile.id, profile.name);
												}}
											>
												×
											</button>
										)}
									</div>
								))}
								<div className="profile-card add-profile" onClick={handleCreateProfile}>
									<div className="add-profile-icon">+</div>
									<p>Add Profile</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Input Modal for creating new profile */}
			<InputModal
				isOpen={showInputModal}
				onClose={() => setShowInputModal(false)}
				onConfirm={handleProfileNameSubmit}
				title="Create New Profile"
				placeholder="Enter profile name"
				confirmText="Create"
			/>

			{/* Confirm Modal for deleting profile */}
			<ConfirmModal
				isOpen={showConfirmModal}
				onClose={() => {
					setShowConfirmModal(false);
					setProfileToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title="Delete Profile"
				message={`Are you sure you want to delete "${profileToDelete?.name}"? This action cannot be undone.`}
				confirmText="Delete"
				type="danger"
			/>
		</>
	);
};

export default ProfileDrawer;
