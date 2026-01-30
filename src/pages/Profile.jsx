import React, { useCallback } from "react";
import ConfirmModal from "../components/modal/ConfirmModal";
import { ExclamationTriangleIcon, XCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useProfileData } from "../hooks/useProfileData";
import ProfileHeader from "../components/Profile/ProfileHeader";
import AccountInfo from "../components/Profile/AccountInfo";
import SecuritySection from "../components/Profile/SecuritySection";
import DangerZone from "../components/Profile/DangerZone";

const Profile = () => {
	// Custom Hook
	const {
		// Data
		currentUser,
		isGoogleUser,
		hasPassword,

		// Name State
		isEditingName,
		setIsEditingName,
		newDisplayName,
		setNewDisplayName,
		isUpdatingName,
		handleUpdateDisplayName,
		resetNameEdit,

		// Password State
		isCreatingPassword,
		setIsCreatingPassword,
		isChangingPassword,
		setIsChangingPassword,
		currentPassword,
		setCurrentPassword,
		newPassword,
		setNewPassword,
		confirmPassword,
		setConfirmPassword,
		isSettingPassword,
		isChangingPasswordLoading,
		handleCreatePassword,
		handleChangePassword,
		resetPasswordForms,

		// Deletion State
		showDeleteModal,
		setShowDeleteModal,
		showPasswordConfirmModal,
		setShowPasswordConfirmModal,
		deleteConfirmPassword,
		setDeleteConfirmPassword,
		isDeletingData,
		handleDeleteAllData,
		resetDeleteForms,
	} = useProfileData();

	// Handle password confirmation for deletion (UI handler)
	const handlePasswordConfirmDelete = useCallback(
		async (e) => {
			e.preventDefault();
			if (!deleteConfirmPassword) return; // Hook handles validation
			// We need to call the deletion logic from hook manually here because the form submit is UI specific
			// But wait, the hook exposes handleDeleteAllData which takes password.
			// The form is just a way to get that password.

			await handleDeleteAllData(deleteConfirmPassword);
			// The hook handles closing modals etc on success/failure
		},
		[deleteConfirmPassword, handleDeleteAllData]
	);

	return (
		<div className="min-h-[calc(100vh-60px)] py-8 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<ProfileHeader />

				{/* Profile Grid */}
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
					{/* Account Information Card */}
					<AccountInfo
						currentUser={currentUser}
						isEditingName={isEditingName}
						setIsEditingName={setIsEditingName}
						newDisplayName={newDisplayName}
						setNewDisplayName={setNewDisplayName}
						isUpdatingName={isUpdatingName}
						handleUpdateDisplayName={handleUpdateDisplayName}
						handleCancelEdit={resetNameEdit}
						isGoogleUser={isGoogleUser}
					/>

					{/* Security Settings Card */}
					<SecuritySection
						isGoogleUser={isGoogleUser}
						hasPassword={hasPassword}
						isCreatingPassword={isCreatingPassword}
						setIsCreatingPassword={setIsCreatingPassword}
						newPassword={newPassword}
						setNewPassword={setNewPassword}
						confirmPassword={confirmPassword}
						setConfirmPassword={setConfirmPassword}
						isSettingPassword={isSettingPassword}
						handleCreatePassword={handleCreatePassword}
						handleCancelPassword={resetPasswordForms}
						isChangingPassword={isChangingPassword}
						setIsChangingPassword={setIsChangingPassword}
						currentPassword={currentPassword}
						setCurrentPassword={setCurrentPassword}
						isChangingPasswordLoading={isChangingPasswordLoading}
						handleChangePassword={handleChangePassword}
						handleCancelPasswordChange={resetPasswordForms}
					/>
				</div>

				{/* Danger Zone */}
				<DangerZone onShowDeleteModal={() => setShowDeleteModal(true)} isDeletingData={isDeletingData} />
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={resetDeleteForms}
				onConfirm={() => handleDeleteAllData(null, false)} // Initial no-password attempt
				title="Delete Account & All Data"
				message="Are you absolutely sure you want to delete your account and all associated data? This action cannot be undone and will permanently remove all your profiles, shared data, and account information."
				confirmText="Delete Everything"
				type="danger"
			/>

			{/* Password Confirmation Modal for Deletion */}
			{showPasswordConfirmModal && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-600 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
						<div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-center">
							<div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<ExclamationTriangleIcon className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-2xl font-bold text-white">Confirm Account Deletion</h3>
							<p className="text-red-100 mt-2">This action cannot be undone</p>
						</div>
						<form onSubmit={handlePasswordConfirmDelete} className="p-6 space-y-6">
							<div>
								<p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-center">
									Please enter your password to confirm account deletion:
								</p>
								<input
									type="password"
									value={deleteConfirmPassword}
									onChange={(e) => setDeleteConfirmPassword(e.target.value)}
									placeholder="Enter your password"
									className="w-full p-4 border-2 border-gray-200/60 dark:border-white/20 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm text-main transition-all duration-300 focus:border-red-500 focus:ring-4 focus:ring-red-200/50 dark:focus:ring-red-800/50"
									required
								/>
							</div>

							{/* Google Authentication Option - Only show if user has both password and Google */}
							{isGoogleUser && hasPassword && (
								<div className="text-center">
									<div className="relative my-4">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-gray-300 dark:border-gray-600" />
										</div>
										<div className="relative flex justify-center text-sm">
											<span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">
												or
											</span>
										</div>
									</div>
									<button
										type="button"
										onClick={() => {
											resetDeleteForms();
											handleDeleteAllData(null, true); // Call with useGoogleAuth = true
										}}
										className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 underline"
									>
										Use Google Authentication instead
									</button>
								</div>
							)}

							<div className="flex gap-3">
								<button
									type="button"
									onClick={resetDeleteForms}
									className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
								>
									<XCircleIcon className="w-5 h-5" />
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									disabled={!deleteConfirmPassword.trim()}
								>
									<TrashIcon className="w-5 h-5" />
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
