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
	onCopySharedProfile,
	sharedProfiles,
	mySharedProfiles = [],
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
			onShareProfile(profileId);
		}
	};

	const handleUnshareProfile = async (shareId, event) => {
		event.stopPropagation();
		if (onUnshareProfile) {
			await onUnshareProfile(shareId);
		}
	};

	const handleCopyProfile = async (shareId, profileName, event) => {
		event.stopPropagation();
		if (onCopySharedProfile) {
			await onCopySharedProfile(shareId, profileName);
		}
	};

	// Icons
	const ShareIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
		</svg>
	);

	const CopyIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
		</svg>
	);

	const EditIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
		</svg>
	);

	const UnshareIcon = () => (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92zM3 3l18 18-1.41 1.41L3 3z" />
		</svg>
	);

	// Check if profile is shared (legacy)
	const getProfileSharedStatus = (profileId) => {
		return sharedProfiles?.find((shared) => shared.profileId === profileId);
	};

	// Check if profile is shared with users (new system)
	const getProfileUserShares = (profileId) => {
		return mySharedProfiles?.filter((share) => share.profileId === profileId && share.isActive) || [];
	};

	// Group profiles into categories
	const ownProfiles = profiles.filter((p) => !p.isShared);
	const sharedWithMeProfiles = profiles.filter((p) => p.isShared);

	return (
		<>
			{isOpen && (
				<div className="profile-drawer-overlay" onClick={handleOverlayClick}>
					<div className="profile-drawer">
						<div className="profile-drawer-handle"></div>
						<div className="profile-drawer-content">
							<h3>My Profiles</h3>
							<div className="profile-grid">
								{ownProfiles.map((profile) => {
									const sharedStatus = getProfileSharedStatus(profile.id);
									const userShares = getProfileUserShares(profile.id);
									const hasUserShares = userShares.length > 0;

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
													{profile.semesters?.length || 0} semester
													{(profile.semesters?.length || 0) !== 1 ? "s" : ""}
												</p>
												{(sharedStatus || hasUserShares) && (
													<span className="shared-badge">
														Shared {hasUserShares && `(${userShares.length} users)`}
													</span>
												)}
											</div>
											<div className="profile-actions">
												{/* Enhanced Share Button */}
												<button
													className="share-btn"
													onClick={(e) => handleShareProfile(profile.id, e)}
													title="Share with users"
													disabled={isLoading}
												>
													<ShareIcon />
												</button>

												{/* Delete Button */}
												{ownProfiles.length > 1 && !profile.isDefault && !profile.isShared && (
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

							{/* Shared With Me Profiles */}
							{sharedWithMeProfiles.length > 0 && (
								<div className="shared-section">
									<h3>Shared With Me</h3>
									<div className="profile-grid">
										{sharedWithMeProfiles.map((profile) => (
											<div
												key={`shared-${profile.id}`}
												className={`profile-card shared-profile ${
													currentProfile === profile.id ? "active" : ""
												}`}
												onClick={() => {
													onProfileSelect(profile.id);
													onClose();
												}}
											>
												<div className="profile-info">
													<h4>{profile.name}</h4>
													<p>
														{profile.semesters?.length || 0} semester
														{(profile.semesters?.length || 0) !== 1 ? "s" : ""}
													</p>
													<div className="shared-info">
														<span className={`permission-badge ${profile.permission}`}>
															{profile.permission === "read" ? (
																<>
																	<svg
																		width="12"
																		height="12"
																		viewBox="0 0 24 24"
																		fill="none"
																		stroke="currentColor"
																		strokeWidth="2"
																	>
																		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
																		<circle cx="12" cy="12" r="3"></circle>
																	</svg>
																	Read Only
																</>
															) : (
																<>
																	<svg
																		width="12"
																		height="12"
																		viewBox="0 0 24 24"
																		fill="none"
																		stroke="currentColor"
																		strokeWidth="2"
																	>
																		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
																		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
																	</svg>
																	Edit Access
																</>
															)}
														</span>
														<span className="shared-by">
															Shared by {profile.ownerEmail || "another user"}
														</span>
													</div>
												</div>
												<div className="profile-actions">
													{/* Copy Button for Read-Only */}
													{profile.permission === "read" && (
														<button
															className="copy-btn"
															onClick={(e) =>
																handleCopyProfile(profile.shareId, profile.name, e)
															}
															title="Copy to my account"
															disabled={isLoading}
														>
															<CopyIcon />
														</button>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							)}

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
