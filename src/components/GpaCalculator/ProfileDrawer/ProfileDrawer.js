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
	onShareProfile,
	onUnshareProfile,
	sharedProfiles,
	isLoading,
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

	const handleShareProfile = async (profileId, event) => {
		event.stopPropagation();
		if (onShareProfile) {
			await onShareProfile(profileId, {
				allowCopy: true,
				expirationDays: 30,
			});
		}
	};

	const handleUnshareProfile = async (shareId, event) => {
		event.stopPropagation();
		if (onUnshareProfile) {
			await onUnshareProfile(shareId);
		}
	};

	// Icons
	const ShareIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
			<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
		</svg>
	);

	const UnshareIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
			<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92zM3 3l18 18-1.41 1.41L3 3z" />
		</svg>
	);

	// Check if profile is shared
	const getProfileSharedStatus = (profileId) => {
		return sharedProfiles?.find((shared) => shared.profileId === profileId);
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
								{profiles.map((profile) => {
									const sharedStatus = getProfileSharedStatus(profile.id);
									return (
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
												{sharedStatus && <span className="shared-badge">Shared</span>}
											</div>
											<div className="profile-actions">
												{/* Share/Unshare Button */}
												{sharedStatus ? (
													<button
														className="unshare-btn"
														onClick={(e) => handleUnshareProfile(sharedStatus.id, e)}
														title="Unshare profile"
														disabled={isLoading}
													>
														<UnshareIcon />
													</button>
												) : (
													<button
														className="share-btn"
														onClick={(e) => handleShareProfile(profile.id, e)}
														title="Share profile"
														disabled={isLoading}
													>
														<ShareIcon />
													</button>
												)}

												{/* Delete Button */}
												{profiles.length > 1 && !profile.isDefault && (
													<button
														className="delete-profile-btn"
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteProfile(profile.id, profile.name);
														}}
														title="Delete profile"
													>
														×
													</button>
												)}
											</div>
										</div>
									);
								})}
								<div className="profile-card add-profile" onClick={handleCreateProfile}>
									<div className="add-profile-icon">+</div>
									<p>Add Profile</p>
								</div>
							</div>

							{/* Shared Profiles Section */}
							{sharedProfiles && sharedProfiles.length > 0 && (
								<div className="shared-profiles-section">
									<h4>Shared Profiles</h4>
									<div className="shared-profiles-list">
										{sharedProfiles.map((shared) => {
											const profile = profiles.find((p) => p.id === shared.profileId);
											return (
												<div key={shared.id} className="shared-profile-item">
													<div className="shared-profile-info">
														<span className="shared-profile-name">
															{profile?.name || "Unknown Profile"}
														</span>
														<span className="shared-profile-url">{shared.shareUrl}</span>
														<div className="shared-profile-meta">
															<span>
																Created:{" "}
																{new Date(shared.createdAt).toLocaleDateString()}
															</span>
															{shared.expiresAt && (
																<span>
																	Expires:{" "}
																	{new Date(shared.expiresAt).toLocaleDateString()}
																</span>
															)}
														</div>
													</div>
													<button
														className="copy-link-btn"
														onClick={(e) => {
															e.stopPropagation();
															navigator.clipboard.writeText(shared.shareUrl);
														}}
														title="Copy share link"
													>
														Copy Link
													</button>
												</div>
											);
										})}
									</div>
								</div>
							)}
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
