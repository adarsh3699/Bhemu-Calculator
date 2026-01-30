import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../firebase/AuthContext";
import { useMessage } from "../components/common/message/MessageProvider";
import { useNavigate } from "react-router-dom";

export const useProfileData = () => {
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

	// Password States
	const [isCreatingPassword, setIsCreatingPassword] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Deletion States
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
		async (password = null, useGoogleAuth = false) => {
			setIsDeletingData(true);

			try {
				const userHasPassword = hasPassword();
				const userHasGoogle = isGoogleUser();

				// If no specific auth method chosen, determine what to show
				if (!password && !useGoogleAuth) {
					if (userHasPassword) {
						// Has password → Show password modal first
						setIsDeletingData(false);
						setShowDeleteModal(false);
						setShowPasswordConfirmModal(true);
						return;
					} else if (userHasGoogle) {
						// Google only → Direct Google auth
						useGoogleAuth = true;
					}
				}

				const result = await deleteAllUserData(password, useGoogleAuth);
				if (result.success) {
					showMessage("Account and all data deleted successfully. Redirecting...", "success");
					setTimeout(() => {
						navigate("/login", { replace: true });
					}, 2000);
				} else if (result.requiresPassword) {
					setIsDeletingData(false);
					setShowDeleteModal(false);
					setShowPasswordConfirmModal(true);
				} else if (result.requiresRelogin) {
					showMessage(result.error, "error");
					setIsDeletingData(false);
					setShowDeleteModal(false);
					setTimeout(() => {
						navigate("/login", { replace: true });
					}, 3000);
				} else {
					showMessage(result.error || "Failed to delete account data", "error");
					setIsDeletingData(false);
					setShowDeleteModal(false);
				}
			} catch (error) {
				console.error("Deletion error:", error);
				showMessage("Failed to delete account data. Please try again.", "error");
				setIsDeletingData(false);
				setShowDeleteModal(false);
			}
		},
		[deleteAllUserData, navigate, showMessage, hasPassword, isGoogleUser]
	);

	// Reset functions
	const resetNameEdit = () => {
		setIsEditingName(false);
		setNewDisplayName(currentUser?.displayName || "");
	};

	const resetPasswordForms = () => {
		setIsCreatingPassword(false);
		setIsChangingPassword(false);
		setNewPassword("");
		setConfirmPassword("");
		setCurrentPassword("");
	};

	const resetDeleteForms = () => {
		setShowDeleteModal(false);
		setShowPasswordConfirmModal(false);
		setDeleteConfirmPassword("");
	};

	return {
		// Data
		currentUser,
		isGoogleUser: isGoogleUser(),
		hasPassword: hasPassword(),

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
	};
};
