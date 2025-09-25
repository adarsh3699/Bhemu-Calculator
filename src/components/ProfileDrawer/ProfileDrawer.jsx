import React, { useState, useEffect } from "react";
import {
	ShareIcon,
	DocumentDuplicateIcon,
	PencilIcon,
	NoSymbolIcon,
	EyeIcon,
	ArrowDownTrayIcon,
	XMarkIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import "./ProfileDrawer.css";
import { InputModal, ConfirmModal } from "../common";
import UMSFetchModal from "../modal/UMSFetchModal.jsx";

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
	onVerifyUMS,
	sharedProfiles,
	mySharedProfiles = [],
	isLoading,
}) => {
	const [showInputModal, setShowInputModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [profileToDelete, setProfileToDelete] = useState(null);
	const [showUMSModal, setShowUMSModal] = useState(false);
	const [profileToVerify, setProfileToVerify] = useState(null);

	// Prevent background scrolling when drawer is open
	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "auto";
		return () => (document.body.style.overflow = "auto");
	}, [isOpen]);

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

	const handleVerifyUMS = (profileId, event) => {
		event.stopPropagation();
		const profile = profiles.find((p) => p.id === profileId);
		if (profile) {
			setProfileToVerify(profile);
			setShowUMSModal(true);
		}
	};

	const handleUMSConfirm = (umsData) => {
		if (onVerifyUMS && profileToVerify) {
			onVerifyUMS(profileToVerify.id, umsData);
			setProfileToVerify(null);
		}
		setShowUMSModal(false);
	};

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
											className={`profile-drawer-card ${
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
												{(sharedStatus || hasUserShares) && (
													<span className="shared-badge">
														Shared {hasUserShares && `(${userShares.length} users)`}
													</span>
												)}
											</div>
											<div className="profile-actions">
												{/* UMS Import Button */}
												<button
													className="ums-verify-btn"
													onClick={(e) => handleVerifyUMS(profile.id, e)}
													title="Import data from UMS"
													disabled={isLoading}
												>
													<ArrowDownTrayIcon className="w-5 h-5" />
												</button>

												{/* Enhanced Share Button */}
												<button
													className="share-btn"
													onClick={(e) => handleShareProfile(profile.id, e)}
													title="Share with users"
													disabled={isLoading}
												>
													<ShareIcon className="w-5 h-5" />
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
														<XMarkIcon className="w-5 h-5" />
													</button>
												)}
											</div>
										</div>
									);
								})}
								<div className="profile-drawer-card add-profile" onClick={handleCreateProfile}>
									<div className="add-profile-icon">
										<PlusIcon className="w-8 h-8" />
									</div>
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
												className={`profile-drawer-card shared-profile ${
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
																	<EyeIcon className="w-3 h-3" />
																	Read Only
																</>
															) : (
																<>
																	<PencilIcon className="w-3 h-3" />
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
															<DocumentDuplicateIcon className="w-5 h-5" />
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
										{sharedProfiles.map((shared) => (
											<div key={shared.shareId} className="shared-profile-item">
												<div className="shared-profile-info">
													<h5>{shared.profileName}</h5>
													<p>
														Shared with {shared.targetUserEmail} •{" "}
														{shared.permission === "read" ? "Read Only" : "Edit Access"}
													</p>
												</div>
												<div className="shared-profile-actions">
													<button
														className="unshare-btn"
														onClick={(e) => handleUnshareProfile(shared.shareId, e)}
														title="Unshare profile"
														disabled={isLoading}
													>
														<NoSymbolIcon className="w-5 h-5" />
													</button>
												</div>
											</div>
										))}
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

			{/* UMS Fetch Modal */}
			<UMSFetchModal
				isOpen={showUMSModal}
				onClose={() => {
					setShowUMSModal(false);
					setProfileToVerify(null);
				}}
				onConfirm={handleUMSConfirm}
				existingData={profileToVerify?.semesters?.length > 0 ? profileToVerify : null}
				profileName={profileToVerify?.name || ""}
			/>
		</>
	);
};

export default ProfileDrawer;
