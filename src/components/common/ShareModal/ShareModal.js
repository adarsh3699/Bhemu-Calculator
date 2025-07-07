import React, { useState, useCallback } from "react";
import { Modal } from "react-responsive-modal";
import "./ShareModal.css";

const ShareModal = ({ isOpen, onClose, onShareWithUser, profileName, currentShares = [] }) => {
	const [targetEmail, setTargetEmail] = useState("");
	const [permission, setPermission] = useState("read");
	const [isSharing, setIsSharing] = useState(false);
	const [error, setError] = useState("");

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
				setTargetEmail("");
				setPermission("read");
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
			setTargetEmail("");
			setPermission("read");
			setError("");
			onClose();
		}
	}, [isSharing, onClose]);

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
			<div className="share-modal-content">
				<button className="share-modal-close-btn" onClick={handleClose} disabled={isSharing}>
					<svg
						width="25"
						height="25"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
				<h2>Share Profile</h2>
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
											{share.permission === "read" ? "Read Only" : "Edit Access"}
										</div>
										<div className="share-date">
											Shared on {new Date(share.sharedAt?.toDate()).toLocaleDateString()}
										</div>
									</div>
									<button
										type="button"
										onClick={() => onShareWithUser(share.shareId, "unshare")}
										className="unshare-btn"
										disabled={isSharing}
									>
										Remove
									</button>
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
