import React, { useState, useCallback } from "react";
import { Modal } from "react-responsive-modal";
import { CloseIcon, EditIcon } from "../../../assets/icons";
import "./ShareModal.css";

const ShareModal = ({ isOpen, onClose, onShareWithUser, profileName, currentShares = [] }) => {
	const [targetEmail, setTargetEmail] = useState("");
	const [permission, setPermission] = useState("read");
	const [isSharing, setIsSharing] = useState(false);
	const [error, setError] = useState("");

	const resetForm = () => {
		setTargetEmail("");
		setPermission("read");
		setError("");
	};

	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault();
			if (!targetEmail.trim()) {
				setError("Please enter a valid email address");
				return;
			}

			// Basic email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(targetEmail)) {
				setError("Please enter a valid email address");
				return;
			}

			// Check if already shared with this user
			const existingShare = currentShares.find(
				(share) => share.targetUserEmail === targetEmail && share.isActive
			);
			if (existingShare) {
				setError("Profile is already shared with this user");
				return;
			}

			setIsSharing(true);
			setError("");

			try {
				await onShareWithUser(targetEmail, permission);
				resetForm();
				onClose();
			} catch (error) {
				setError(error.message || "Failed to share profile");
			} finally {
				setIsSharing(false);
			}
		},
		[targetEmail, permission, currentShares, onShareWithUser, onClose]
	);

	const handleClose = useCallback(() => {
		if (!isSharing) {
			resetForm();
			onClose();
		}
	}, [isSharing, onClose]);

	const handlePermissionChange = useCallback(
		async (shareId, currentPermission) => {
			const newPermission = currentPermission === "read" ? "edit" : "read";
			setIsSharing(true);
			setError("");

			try {
				await onShareWithUser(shareId, newPermission, "updatePermission");
			} catch (error) {
				setError(error.message || "Failed to update permission");
			} finally {
				setIsSharing(false);
			}
		},
		[onShareWithUser]
	);

	const handleUnshare = useCallback(
		async (shareId) => {
			setIsSharing(true);
			setError("");

			try {
				await onShareWithUser(shareId, "unshare");
			} catch (error) {
				setError(error.message || "Failed to remove share");
			} finally {
				setIsSharing(false);
			}
		},
		[onShareWithUser]
	);

	return (
		<Modal
			open={isOpen}
			onClose={handleClose}
			center
			showCloseIcon={false}
			classNames={{
				modal: "share-modal",
				overlay: "share-modal-overlay",
			}}
		>
			<div className="share-modal-header">
				<h2>Share Profile</h2>
				<button className="share-modal-close-btn" onClick={handleClose} disabled={isSharing}>
					<CloseIcon />
				</button>
			</div>

			<div className="share-modal-content">
				<p className="share-modal-subtitle">Share "{profileName}" with another user</p>

				<form onSubmit={handleSubmit} className="share-form">
					<div className="form-group">
						<label htmlFor="targetEmail">User Email</label>
						<input
							id="targetEmail"
							type="email"
							value={targetEmail}
							onChange={(e) => setTargetEmail(e.target.value)}
							placeholder="Enter user's email address"
							required
							disabled={isSharing}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="permission">Permission Level</label>
						<select
							id="permission"
							value={permission}
							onChange={(e) => setPermission(e.target.value)}
							disabled={isSharing}
						>
							<option value="read">Read Only - Can view and copy</option>
							<option value="edit">Edit Access - Can modify directly</option>
						</select>
						<div className="permission-info">
							{permission === "read" ? (
								<p>The user can view the profile and create a copy to their account.</p>
							) : (
								<p>The user can directly edit the profile. Changes will sync in real-time.</p>
							)}
						</div>
					</div>

					{error && <div className="error-message">{error}</div>}

					<div className="form-actions">
						<button type="button" onClick={handleClose} disabled={isSharing} className="cancel-btn">
							Cancel
						</button>
						<button type="submit" disabled={isSharing} className="share-btn">
							{isSharing ? "Sharing..." : "Share Profile"}
						</button>
					</div>
				</form>

				{currentShares.length > 0 && (
					<div className="current-shares">
						<h3>Currently Shared With</h3>
						<div className="shares-list">
							{currentShares.map((share) => (
								<div key={share.shareId} className="share-item">
									<div className="share-info">
										<div className="share-email">{share.targetUserEmail}</div>
										<div className="share-permission">
											<span className={`permission-badge ${share.permission}`}>
												{share.permission === "read" ? "Read Only" : "Edit Access"}
											</span>
										</div>
										<div className="share-date">
											Shared on {new Date(share.sharedAt?.toDate()).toLocaleDateString()}
										</div>
									</div>
									<div className="share-actions">
										<button
											type="button"
											onClick={() => handlePermissionChange(share.shareId, share.permission)}
											className="edit-permission-btn"
											disabled={isSharing}
											title={`Change to ${
												share.permission === "read" ? "Edit Access" : "Read Only"
											}`}
										>
											<EditIcon />
											{share.permission === "read" ? "Grant Edit" : "Make Read-Only"}
										</button>
										<button
											type="button"
											onClick={() => handleUnshare(share.shareId)}
											className="unshare-btn"
											disabled={isSharing}
										>
											Remove
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default ShareModal;
