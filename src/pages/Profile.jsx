import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { ConfirmModal, useMessage } from "../components/common";
import "../styles/profile.css";

const Profile = () => {
	const {
		currentUser,
		updateDisplayName,
		createPassword,
		changePassword,
		deleteAllUserData,
		isGoogleUser,
		hasPassword,
	} = useAuth();
	const navigate = useNavigate();
	const { showMessage } = useMessage();

	// State management
	const [isEditingName, setIsEditingName] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const [isCreatingPassword, setIsCreatingPassword] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
	const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");

	// Loading states
	const [isUpdatingName, setIsUpdatingName] = useState(false);
	const [isSettingPassword, setIsSettingPassword] = useState(false);
	const [isChangingPasswordLoading, setIsChangingPasswordLoading] = useState(false);
	const [isDeletingData, setIsDeletingData] = useState(false);

	// Initialize display name
	useEffect(() => {
		if (currentUser?.displayName) {
			setNewDisplayName(currentUser.displayName);
		}
	}, [currentUser]);

	// Handle display name update
	const handleUpdateDisplayName = useCallback(async () => {
		if (!newDisplayName.trim()) {
			showMessage("Display name cannot be empty", "error");
			return;
		}

		setIsUpdatingName(true);

		try {
			const result = await updateDisplayName(newDisplayName.trim());
			if (result.success) {
				showMessage("Display name updated successfully", "success");
				setIsEditingName(false);
			} else {
				showMessage(result.error || "Failed to update display name", "error");
			}
		} catch (error) {
			showMessage("Failed to update display name", "error");
		} finally {
			setIsUpdatingName(false);
		}
	}, [newDisplayName, updateDisplayName, showMessage]);

	// Handle password creation
	const handleCreatePassword = useCallback(
		async (e) => {
			e.preventDefault();

			if (newPassword !== confirmPassword) {
				showMessage("Passwords do not match", "error");
				return;
			}

			if (newPassword.length < 6) {
				showMessage("Password must be at least 6 characters long", "error");
				return;
			}

			setIsSettingPassword(true);

			try {
				const result = await createPassword(newPassword);
				if (result.success) {
					showMessage("Password created successfully! You can now login with email and password.", "success");
					setIsCreatingPassword(false);
					setNewPassword("");
					setConfirmPassword("");
				} else {
					showMessage(result.error || "Failed to create password", "error");
				}
			} catch (error) {
				showMessage("Failed to create password", "error");
			} finally {
				setIsSettingPassword(false);
			}
		},
		[newPassword, confirmPassword, createPassword, showMessage]
	);

	// Handle password change
	const handleChangePassword = useCallback(
		async (e) => {
			e.preventDefault();

			if (!currentPassword) {
				showMessage("Please enter your current password", "error");
				return;
			}

			if (newPassword !== confirmPassword) {
				showMessage("New passwords do not match", "error");
				return;
			}

			if (newPassword.length < 6) {
				showMessage("New password must be at least 6 characters long", "error");
				return;
			}

			if (currentPassword === newPassword) {
				showMessage("New password must be different from current password", "error");
				return;
			}

			setIsChangingPasswordLoading(true);

			try {
				const result = await changePassword(currentPassword, newPassword);
				if (result.success) {
					showMessage("Password changed successfully!", "success");
					setIsChangingPassword(false);
					setCurrentPassword("");
					setNewPassword("");
					setConfirmPassword("");
				} else {
					showMessage(result.error || "Failed to change password", "error");
				}
			} catch (error) {
				showMessage("Failed to change password", "error");
			} finally {
				setIsChangingPasswordLoading(false);
			}
		},
		[currentPassword, newPassword, confirmPassword, changePassword, showMessage]
	);

	// Handle delete all data
	const handleDeleteAllData = useCallback(
		async (password = null) => {
			setIsDeletingData(true);

			try {
				const result = await deleteAllUserData(password);
				if (result.success) {
					// User will be automatically logged out and redirected
					navigate("/login");
				} else if (result.requiresPassword) {
					// Show password confirmation modal
					setIsDeletingData(false);
					setShowDeleteModal(false);
					setShowPasswordConfirmModal(true);
				} else {
					showMessage(result.error || "Failed to delete account data", "error");
				}
			} catch (error) {
				showMessage("Failed to delete account data", "error");
			} finally {
				setIsDeletingData(false);
				setShowDeleteModal(false);
			}
		},
		[deleteAllUserData, navigate, showMessage]
	);

	// Handle password confirmation for deletion
	const handlePasswordConfirmDelete = useCallback(
		async (e) => {
			e.preventDefault();
			if (!deleteConfirmPassword) {
				showMessage("Please enter your password", "error");
				return;
			}

			setShowPasswordConfirmModal(false);
			setDeleteConfirmPassword("");
			await handleDeleteAllData(deleteConfirmPassword);
		},
		[deleteConfirmPassword, handleDeleteAllData, showMessage]
	);

	// Format date helper
	const formatDate = (dateString) => {
		if (!dateString) return "Not available";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Cancel edit name
	const handleCancelEdit = () => {
		setIsEditingName(false);
		setNewDisplayName(currentUser?.displayName || "");
	};

	// Cancel password creation
	const handleCancelPassword = () => {
		setIsCreatingPassword(false);
		setNewPassword("");
		setConfirmPassword("");
	};

	// Cancel password change
	const handleCancelPasswordChange = () => {
		setIsChangingPassword(false);
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
	};

	// Cancel password confirmation for deletion
	const handleCancelPasswordConfirm = () => {
		setShowPasswordConfirmModal(false);
		setDeleteConfirmPassword("");
	};

	return (
		<div className="profilePage">
			{/* Header */}
			<div className="profile-header">
				<h1>Your Profile</h1>
				<p>Manage your account settings and preferences</p>
			</div>

			{/* Messages will be shown as popups using MessageProvider */}

			{/* Profile Grid */}
			<div className="profile-grid">
				{/* Account Information Card */}
				<div className="profile-card">
					<div className="profile-card-header">
						<div className="profile-card-icon">👤</div>
						<h2 className="profile-card-title">Account Information</h2>
					</div>

					{/* Display Name */}
					<div className="profile-item">
						<span className="profile-item-label">Display Name:</span>
						{isEditingName ? (
							<div className="profile-item-editable">
								<input
									type="text"
									value={newDisplayName}
									onChange={(e) => setNewDisplayName(e.target.value)}
									className="profile-item-edit-input"
									placeholder="Enter display name"
									disabled={isUpdatingName}
								/>
								<div className="profile-item-edit-actions">
									<button
										onClick={handleUpdateDisplayName}
										disabled={isUpdatingName}
										className="profile-item-save-btn"
									>
										{isUpdatingName ? "Saving..." : "Save"}
									</button>
									<button
										onClick={handleCancelEdit}
										disabled={isUpdatingName}
										className="profile-item-cancel-btn"
									>
										Cancel
									</button>
								</div>
							</div>
						) : (
							<div className="profile-item-editable">
								<span className="profile-item-value">{currentUser?.displayName || "Not set"}</span>
								<button onClick={() => setIsEditingName(true)} className="profile-item-edit-btn">
									Edit
								</button>
							</div>
						)}
					</div>

					{/* Email */}
					<div className="profile-item">
						<span className="profile-item-label">Email:</span>
						<span className="profile-item-value">{currentUser?.email}</span>
					</div>

					{/* Account Type */}
					<div className="profile-item">
						<span className="profile-item-label">Account Type:</span>
						<span className="profile-item-value">
							{isGoogleUser() ? (
								<span className="profile-status-badge profile-status-google">Google Account</span>
							) : (
								<span className="profile-status-badge profile-status-verified">Email Account</span>
							)}
						</span>
					</div>

					{/* Email Verification */}
					<div className="profile-item">
						<span className="profile-item-label">Email Verified:</span>
						<span className="profile-item-value">
							{currentUser?.emailVerified ? (
								<span className="profile-status-badge profile-status-verified">Verified</span>
							) : (
								<span className="profile-status-badge profile-status-unverified">Not Verified</span>
							)}
						</span>
					</div>

					{/* Account Created */}
					<div className="profile-item">
						<span className="profile-item-label">Account Created:</span>
						<span className="profile-item-value">{formatDate(currentUser?.metadata?.creationTime)}</span>
					</div>

					{/* Last Sign In - Only show if not Google account */}
					{!isGoogleUser() && (
						<div className="profile-item">
							<span className="profile-item-label">Last Sign In:</span>
							<span className="profile-item-value">
								{formatDate(currentUser?.metadata?.lastSignInTime)}
							</span>
						</div>
					)}

					{/* Navigation */}
					<Link to="/gpa-calculator" className="profile-btn profile-btn-primary">
						Go to Calculator
					</Link>
				</div>

				{/* Security Settings Card */}
				<div className="profile-card">
					<div className="profile-card-header">
						<div className="profile-card-icon">🔒</div>
						<h2 className="profile-card-title">Security Settings</h2>
					</div>

					{/* Password Status - Only show if no password is set */}
					{!hasPassword() && (
						<div className="profile-item">
							<span className="profile-item-label">Password:</span>
							<span className="profile-item-value">
								<span className="profile-status-badge profile-status-unverified">No Password</span>
							</span>
						</div>
					)}

					{/* Create Password for Google Users */}
					{isGoogleUser() && !hasPassword() && (
						<div className="profile-form" style={{ marginTop: "10px" }}>
							{!isCreatingPassword ? (
								<>
									<div className="profile-form-header">
										<h4>Create Password</h4>
										<p>Set up a password to enable email/password login for your account</p>
									</div>
									<button
										onClick={() => setIsCreatingPassword(true)}
										className="profile-btn profile-btn-secondary"
									>
										Create Password
									</button>
								</>
							) : (
								<form onSubmit={handleCreatePassword}>
									<div className="profile-form-header">
										<h4>Create Password</h4>
										<p>Password must be at least 6 characters long</p>
									</div>

									{/* Messages will be shown as popups using MessageProvider */}

									<div className="profile-form-group">
										<label htmlFor="set-new-password" className="profile-form-label">
											New Password:
										</label>
										<input
											id="set-new-password"
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											className="profile-form-input"
											placeholder="Enter new password"
											required
											minLength={6}
											disabled={isSettingPassword}
										/>
									</div>
									<div className="profile-form-group">
										<label htmlFor="set-confirm-password" className="profile-form-label">
											Confirm Password:
										</label>
										<input
											id="set-confirm-password"
											type="password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											className="profile-form-input"
											placeholder="Confirm new password"
											required
											minLength={6}
											disabled={isSettingPassword}
										/>
									</div>
									<div className="profile-form-actions">
										<button
											type="submit"
											disabled={isSettingPassword}
											className="profile-btn profile-btn-primary"
										>
											{isSettingPassword ? (
												<span className="profile-loading">
													<span className="profile-spinner"></span>
													Creating Password...
												</span>
											) : (
												"Create Password"
											)}
										</button>
										<button
											type="button"
											onClick={handleCancelPassword}
											disabled={isSettingPassword}
											className="profile-btn profile-btn-secondary"
										>
											Cancel
										</button>
									</div>
								</form>
							)}
						</div>
					)}

					{/* Change Password for Users with Password */}
					{hasPassword() && (
						<div className="profile-form">
							{!isChangingPassword ? (
								<>
									<div className="profile-form-header">
										<h4>Change Password</h4>
										<p>Update your current password for enhanced security</p>
									</div>
									<button
										onClick={() => setIsChangingPassword(true)}
										className="profile-btn profile-btn-secondary"
									>
										Change Password
									</button>
								</>
							) : (
								<form onSubmit={handleChangePassword}>
									<div className="profile-form-header">
										<h4>Change Password</h4>
										<p>Enter your current password and choose a new one</p>
									</div>

									{/* Messages will be shown as popups using MessageProvider */}

									<div className="profile-form-group">
										<label htmlFor="current-password" className="profile-form-label">
											Current Password:
										</label>
										<input
											id="current-password"
											type="password"
											value={currentPassword}
											onChange={(e) => setCurrentPassword(e.target.value)}
											className="profile-form-input"
											placeholder="Enter current password"
											required
											disabled={isChangingPasswordLoading}
										/>
									</div>
									<div className="profile-form-group">
										<label htmlFor="change-new-password" className="profile-form-label">
											New Password:
										</label>
										<input
											id="change-new-password"
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											className="profile-form-input"
											placeholder="Enter new password"
											required
											minLength={6}
											disabled={isChangingPasswordLoading}
										/>
									</div>
									<div className="profile-form-group">
										<label htmlFor="change-confirm-password" className="profile-form-label">
											Confirm New Password:
										</label>
										<input
											id="change-confirm-password"
											type="password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											className="profile-form-input"
											placeholder="Confirm new password"
											required
											minLength={6}
											disabled={isChangingPasswordLoading}
										/>
									</div>
									<div className="profile-form-actions">
										<button
											type="submit"
											disabled={isChangingPasswordLoading}
											className="profile-btn profile-btn-primary"
										>
											{isChangingPasswordLoading ? (
												<span className="profile-loading">
													<span className="profile-spinner"></span>
													Changing Password...
												</span>
											) : (
												"Change Password"
											)}
										</button>
										<button
											type="button"
											onClick={handleCancelPasswordChange}
											disabled={isChangingPasswordLoading}
											className="profile-btn profile-btn-secondary"
										>
											Cancel
										</button>
									</div>
								</form>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Danger Zone */}
			<div className="profile-danger-zone">
				<h3>⚠️ Danger Zone</h3>
				<p>This action will permanently delete your account and all associated data including:</p>
				<ul style={{ marginBottom: "1.5rem", paddingLeft: "2rem", color: "rgba(255, 255, 255, 0.8)" }}>
					<li>All GPA calculation profiles</li>
					<li>All shared profiles and collaboration data</li>
					<li>Account information and settings</li>
					<li>All stored preferences</li>
				</ul>
				<p>
					<strong>This action cannot be undone.</strong> Make sure you have backed up any important data
					before proceeding.
				</p>
				<button
					onClick={() => setShowDeleteModal(true)}
					disabled={isDeletingData}
					className="profile-btn profile-btn-danger"
				>
					{isDeletingData ? (
						<span className="profile-loading">
							<span className="profile-spinner"></span>
							Deleting Account...
						</span>
					) : (
						"Delete Account & All Data"
					)}
				</button>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteAllData}
				title="Delete Account & All Data"
				message="Are you absolutely sure you want to delete your account and all associated data? This action cannot be undone and will permanently remove all your profiles, shared data, and account information."
				confirmText="Delete Everything"
				type="danger"
			/>

			{/* Password Confirmation Modal for Deletion */}
			{showPasswordConfirmModal && (
				<div className="input-modal-overlay">
					<div className="input-modal">
						<div className="input-modal-header">
							<h3>Confirm Account Deletion</h3>
						</div>
						<form onSubmit={handlePasswordConfirmDelete} className="input-modal-form">
							<div className="input-modal-body">
								<p style={{ marginBottom: "15px", color: "#ccc" }}>
									Please enter your password to confirm account deletion:
								</p>
								<input
									type="password"
									value={deleteConfirmPassword}
									onChange={(e) => setDeleteConfirmPassword(e.target.value)}
									placeholder="Enter your password"
									className="input-modal-input"
									required
								/>
							</div>
							<div className="input-modal-actions">
								<button
									type="button"
									onClick={handleCancelPasswordConfirm}
									className="input-modal-btn cancel-btn"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="input-modal-btn confirm-btn"
									disabled={!deleteConfirmPassword.trim()}
								>
									Delete Account
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Profile;
