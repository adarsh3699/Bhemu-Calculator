import React, { useState, useCallback } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import BaseModal from "./BaseModal";

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
		<BaseModal
			isOpen={isOpen}
			onClose={handleClose}
			title="Share Profile"
			maxWidth="800px"
			closeOnEsc={!isSharing}
			closeOnOverlayClick={!isSharing}
			className="auth-card backdrop-blur-xl"
		>
			<div className="p-8 overflow-auto max-h-[calc(85vh-120px)]">
				<p className="mb-6 text-lighter font-medium">Share "{profileName}" with another user</p>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						<label
							htmlFor="targetEmail"
							className="font-semibold text-main text-sm uppercase tracking-wider"
						>
							User Email
						</label>
						<input
							id="targetEmail"
							type="email"
							value={targetEmail}
							onChange={(e) => setTargetEmail(e.target.value)}
							placeholder="Enter user's email address"
							required
							disabled={isSharing}
							className="p-3 rounded-xl border border-white/20 bg-white/10 text-main transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-lighter disabled:opacity-60 disabled:cursor-not-allowed"
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label
							htmlFor="permission"
							className="font-semibold text-main text-sm uppercase tracking-wider"
						>
							Permission Level
						</label>
						<select
							id="permission"
							value={permission}
							onChange={(e) => setPermission(e.target.value)}
							disabled={isSharing}
							className="p-3 rounded-xl border border-white/20 bg-white/10 text-main transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							<option value="read">Read Only - Can view and copy</option>
							<option value="edit">Edit Access - Can modify directly</option>
						</select>
						<div className="mt-2 p-3 bg-white/10 rounded-lg border-l-4 border-indigo-500">
							{permission === "read" ? (
								<p className="text-sm text-lighter">
									The user can view the profile and create a copy to their account.
								</p>
							) : (
								<p className="text-sm text-lighter">
									The user can directly edit the profile. Changes will sync in real-time.
								</p>
							)}
						</div>
					</div>

					{error && (
						<div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
							{error}
						</div>
					)}

					<div className="flex gap-3 justify-end pt-4">
						<button
							type="button"
							onClick={handleClose}
							disabled={isSharing}
							className="btn-google px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSharing}
							className="btn-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							{isSharing ? "Sharing..." : "Share Profile"}
						</button>
					</div>
				</form>

				{currentShares.length > 0 && (
					<div className="mt-8 pt-8 border-t border-white/10">
						<h3 className="text-xl font-semibold mb-4 text-main">Currently Shared With</h3>
						<div className="space-y-4">
							{currentShares.map((share) => (
								<div key={share.shareId} className="bg-white/5 rounded-lg p-4 border border-white/10">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div className="flex-1">
											<div className="font-medium text-main mb-1">{share.targetUserEmail}</div>
											<div className="flex items-center gap-3 mb-2">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														share.permission === "read"
															? "bg-blue-500/20 text-blue-400"
															: "bg-emerald-500/20 text-emerald-400"
													}`}
												>
													{share.permission === "read" ? "Read Only" : "Edit Access"}
												</span>
											</div>
											<div className="text-sm text-lighter">
												Shared on {new Date(share.sharedAt?.toDate()).toLocaleDateString()}
											</div>
										</div>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => handlePermissionChange(share.shareId, share.permission)}
												disabled={isSharing}
												title={`Change to ${
													share.permission === "read" ? "Edit Access" : "Read Only"
												}`}
												className="flex items-center gap-2 px-3 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
											>
												<PencilIcon className="w-4 h-4" />
												{share.permission === "read" ? "Grant Edit" : "Make Read-Only"}
											</button>
											<button
												type="button"
												onClick={() => handleUnshare(share.shareId)}
												disabled={isSharing}
												className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-red-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
											>
												Remove
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</BaseModal>
	);
};

export default ShareModal;
