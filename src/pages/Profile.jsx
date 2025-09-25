import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { ConfirmModal, useMessage } from "../components/common";
import {
	UserIcon,
	LockClosedIcon,
	PencilIcon,
	TrashIcon,
	ArrowPathIcon,
	KeyIcon,
	ShieldCheckIcon,
	CalculatorIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

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
		async (password = null, useGoogleAuth = false) => {
			setIsDeletingData(true);

			try {
				// Simple flow logic:
				// 1. If user has both password and Google → Show password modal first (with Google option)
				// 2. If user has password only → Show password modal (no Google option)
				// 3. If user has Google only → Direct Google auth (no modal)

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
					// Show success message before redirect
					showMessage("Account and all data deleted successfully. Redirecting...", "success");

					// Small delay to show the success message
					setTimeout(() => {
						navigate("/login", { replace: true });
					}, 2000);
				} else if (result.requiresPassword) {
					// Show password confirmation modal
					setIsDeletingData(false);
					setShowDeleteModal(false);
					setShowPasswordConfirmModal(true);
				} else if (result.requiresRelogin) {
					// User selected wrong account and has been signed out for security
					showMessage(result.error, "error");
					setIsDeletingData(false);
					setShowDeleteModal(false);

					// Redirect to login page after a short delay
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
		<div className="min-h-[calc(100vh-60px)] py-8 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
			<div className="max-w-7xl mx-auto">
				{/* Header with enhanced design */}
				<div className="text-center mb-12">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
						<UserIcon className="w-10 h-10 text-white" />
					</div>
					<h1 className="text-5xl font-bold text-gradient mb-4 tracking-tight">Your Profile</h1>
					<p className="text-lighter text-xl max-w-2xl mx-auto leading-relaxed">
						Manage your account settings, security preferences, and personal information
					</p>
				</div>

				{/* Profile Grid with improved layout */}
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
					{/* Account Information Card */}
					<div className="xl:col-span-2 bg-white/90 dark:bg-white/10 backdrop-blur-[20px] rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-300 dark:border-white/20 hover:shadow-2xl transition-all duration-500 group relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gray-400 dark:before:via-white/40 before:to-transparent">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform duration-300">
								<UserIcon className="w-7 h-7" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-main">Account Information</h2>
								<p className="text-gray-700 dark:text-gray-200 text-sm font-semibold">
									Your personal details and account status
								</p>
							</div>
						</div>

						{/* Profile Information Grid */}
						<div className="space-y-4">
							{/* Display Name */}
							<div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
											<UserIcon className="w-5 h-5 text-white" />
										</div>
										<div>
											<p className="font-semibold text-main">Display Name</p>
											<p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
												Your public display name
											</p>
										</div>
									</div>
									{isEditingName ? (
										<div className="flex items-center gap-3 flex-1 max-w-md">
											<input
												type="text"
												value={newDisplayName}
												onChange={(e) => setNewDisplayName(e.target.value)}
												className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-2 border-blue-200/60 dark:border-white/20 rounded-xl px-4 py-2 text-main font-medium flex-1 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:focus:ring-blue-800/50"
												placeholder="Enter display name"
												disabled={isUpdatingName}
											/>
											<div className="flex gap-2">
												<button
													onClick={handleUpdateDisplayName}
													disabled={isUpdatingName}
													className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center gap-2"
												>
													{isUpdatingName ? (
														<ArrowPathIcon className="w-4 h-4 animate-spin" />
													) : (
														<CheckCircleIcon className="w-4 h-4" />
													)}
												</button>
												<button
													onClick={handleCancelEdit}
													disabled={isUpdatingName}
													className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
												>
													<XCircleIcon className="w-4 h-4" />
												</button>
											</div>
										</div>
									) : (
										<div className="flex items-center gap-3">
											<span className="text-main font-semibold bg-gray-100/80 dark:bg-white/10 px-4 py-2 rounded-xl border border-gray-200/60 dark:border-white/20 backdrop-blur-sm">
												{currentUser?.displayName || "Not set"}
											</span>
											<button
												onClick={() => setIsEditingName(true)}
												className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
											>
												<PencilIcon className="w-4 h-4" />
											</button>
										</div>
									)}
								</div>
							</div>

							{/* Email */}
							<div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
											<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
												<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
											</svg>
										</div>
										<div>
											<p className="font-semibold text-main">Email Address</p>
											<p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
												Your registered email
											</p>
										</div>
									</div>
									<span className="text-main font-semibold bg-gray-100/80 dark:bg-white/10 px-4 py-2 rounded-xl border border-gray-200/60 dark:border-white/20 backdrop-blur-sm truncate max-w-xs">
										{currentUser?.email}
									</span>
								</div>
							</div>

							{/* Account Type */}
							<div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
											<ShieldCheckIcon className="w-5 h-5 text-white" />
										</div>
										<div>
											<p className="font-semibold text-main">Account Type</p>
											<p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
												Authentication method
											</p>
										</div>
									</div>
									{isGoogleUser() ? (
										<span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
											Google Account
										</span>
									) : (
										<span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
											Email Account
										</span>
									)}
								</div>
							</div>

							{/* Email Verification */}
							<div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={`w-10 h-10 rounded-xl flex items-center justify-center ${
												currentUser?.emailVerified ? "bg-emerald-500" : "bg-amber-500"
											}`}
										>
											{currentUser?.emailVerified ? (
												<CheckCircleIcon className="w-5 h-5 text-white" />
											) : (
												<ExclamationTriangleIcon className="w-5 h-5 text-white" />
											)}
										</div>
										<div>
											<p className="font-semibold text-main">Email Status</p>
											<p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
												Verification status
											</p>
										</div>
									</div>
									{currentUser?.emailVerified ? (
										<span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
											Verified
										</span>
									) : (
										<span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
											Not Verified
										</span>
									)}
								</div>
							</div>

							{/* Account Created */}
							<div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
											<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path
													fillRule="evenodd"
													d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<div>
											<p className="font-semibold text-main">Account Created</p>
											<p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
												Registration date
											</p>
										</div>
									</div>
									<span className="text-main font-semibold bg-gray-100/80 dark:bg-white/10 px-4 py-2 rounded-xl border border-gray-200/60 dark:border-white/20 backdrop-blur-sm text-sm">
										{formatDate(currentUser?.metadata?.creationTime)}
									</span>
								</div>
							</div>

							{/* Last Sign In - Only show if not Google account */}
							{!isGoogleUser() && (
								<div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
												<svg
													className="w-5 h-5 text-white"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											<div>
												<p className="font-semibold text-main">Last Sign In</p>
												<p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
													Most recent login
												</p>
											</div>
										</div>
										<span className="text-main font-semibold bg-gray-100/80 dark:bg-white/10 px-4 py-2 rounded-xl border border-gray-200/60 dark:border-white/20 backdrop-blur-sm text-sm">
											{formatDate(currentUser?.metadata?.lastSignInTime)}
										</span>
									</div>
								</div>
							)}
						</div>

						{/* Navigation Button */}
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
							<Link
								to="/gpa-calculator"
								className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg flex items-center justify-center gap-3 group"
							>
								<CalculatorIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
								Go to Calculator
								<svg
									className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</Link>
						</div>
					</div>

					{/* Security Settings Card */}
					<div className="xl:col-span-1 bg-white/90 dark:bg-white/10 backdrop-blur-[20px] rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-300 dark:border-white/20 hover:shadow-2xl transition-all duration-500 group relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gray-400 dark:before:via-white/40 before:to-transparent">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform duration-300">
								<LockClosedIcon className="w-7 h-7" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-main">Security Settings</h2>
								<p className="text-gray-700 dark:text-gray-200 text-sm font-semibold">
									Password and account security
								</p>
							</div>
						</div>

						{/* Password Status - Only show if no password is set */}
						{!hasPassword() && (
							<div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-700 mb-6">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
										<ExclamationTriangleIcon className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="font-semibold text-amber-800 dark:text-amber-200">
											No Password Set
										</p>
										<p className="text-xs text-amber-600 dark:text-amber-300">
											Consider setting up a password for additional security
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Create Password for Google Users */}
						{isGoogleUser() && !hasPassword() && (
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-700 shadow-lg">
								{!isCreatingPassword ? (
									<div className="text-center space-y-6">
										<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
											<KeyIcon className="w-8 h-8 text-white" />
										</div>
										<div>
											<h4 className="text-2xl font-bold text-gradient mb-3">Create Password</h4>
											<p className="text-gray-600 dark:text-gray-300 leading-relaxed">
												Set up a password to enable email/password login for your account and
												enhance security
											</p>
										</div>
										<button
											onClick={() => setIsCreatingPassword(true)}
											className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3 group"
										>
											<KeyIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
											Create Password
										</button>
									</div>
								) : (
									<form onSubmit={handleCreatePassword} className="space-y-6">
										<div className="text-center">
											<h4 className="text-2xl font-bold text-gradient mb-3">Create Password</h4>
											<p className="text-gray-600 dark:text-gray-300">
												Password must be at least 6 characters long
											</p>
										</div>

										<div className="space-y-4">
											<div>
												<label
													htmlFor="set-new-password"
													className="block font-semibold text-main mb-2"
												>
													New Password
												</label>
												<input
													id="set-new-password"
													type="password"
													value={newPassword}
													onChange={(e) => setNewPassword(e.target.value)}
													className="w-full p-4 border-2 border-blue-200/60 dark:border-white/20 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm text-main transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 dark:focus:ring-blue-800/50"
													placeholder="Enter new password"
													required
													minLength={6}
													disabled={isSettingPassword}
												/>
											</div>
											<div>
												<label
													htmlFor="set-confirm-password"
													className="block font-semibold text-main mb-2"
												>
													Confirm Password
												</label>
												<input
													id="set-confirm-password"
													type="password"
													value={confirmPassword}
													onChange={(e) => setConfirmPassword(e.target.value)}
													className="w-full p-4 border-2 border-blue-200/60 dark:border-white/20 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm text-main transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 dark:focus:ring-blue-800/50"
													placeholder="Confirm new password"
													required
													minLength={6}
													disabled={isSettingPassword}
												/>
											</div>
										</div>

										<div className="flex gap-3">
											<button
												type="submit"
												disabled={isSettingPassword}
												className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
											>
												{isSettingPassword ? (
													<>
														<ArrowPathIcon className="w-5 h-5 animate-spin" />
														Creating...
													</>
												) : (
													<>
														<KeyIcon className="w-5 h-5" />
														Create Password
													</>
												)}
											</button>
											<button
												type="button"
												onClick={handleCancelPassword}
												disabled={isSettingPassword}
												className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
											>
												<XCircleIcon className="w-5 h-5" />
												Cancel
											</button>
										</div>
									</form>
								)}
							</div>
						)}

						{/* Change Password for Users with Password */}
						{hasPassword() && (
							<div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-700 shadow-lg">
								{!isChangingPassword ? (
									<div className="text-center space-y-6">
										<div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
											<ShieldCheckIcon className="w-8 h-8 text-white" />
										</div>
										<div>
											<h4 className="text-2xl font-bold text-gradient mb-3">Change Password</h4>
											<p className="text-gray-600 dark:text-gray-300 leading-relaxed">
												Update your current password for enhanced security
											</p>
										</div>
										<button
											onClick={() => setIsChangingPassword(true)}
											className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center gap-3 group"
										>
											<ShieldCheckIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
											Change Password
										</button>
									</div>
								) : (
									<form onSubmit={handleChangePassword} className="space-y-6">
										<div className="text-center">
											<h4 className="text-2xl font-bold text-gradient mb-3">Change Password</h4>
											<p className="text-gray-600 dark:text-gray-300">
												Enter your current password and choose a new one
											</p>
										</div>

										<div className="space-y-4">
											<div>
												<label
													htmlFor="current-password"
													className="block font-semibold text-main mb-2"
												>
													Current Password
												</label>
												<input
													id="current-password"
													type="password"
													value={currentPassword}
													onChange={(e) => setCurrentPassword(e.target.value)}
													className="w-full p-4 border-2 border-emerald-200/60 dark:border-white/20 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm text-main transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/50"
													placeholder="Enter current password"
													required
													disabled={isChangingPasswordLoading}
												/>
											</div>
											<div>
												<label
													htmlFor="change-new-password"
													className="block font-semibold text-main mb-2"
												>
													New Password
												</label>
												<input
													id="change-new-password"
													type="password"
													value={newPassword}
													onChange={(e) => setNewPassword(e.target.value)}
													className="w-full p-4 border-2 border-emerald-200/60 dark:border-white/20 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm text-main transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/50"
													placeholder="Enter new password"
													required
													minLength={6}
													disabled={isChangingPasswordLoading}
												/>
											</div>
											<div>
												<label
													htmlFor="change-confirm-password"
													className="block font-semibold text-main mb-2"
												>
													Confirm New Password
												</label>
												<input
													id="change-confirm-password"
													type="password"
													value={confirmPassword}
													onChange={(e) => setConfirmPassword(e.target.value)}
													className="w-full p-4 border-2 border-emerald-200/60 dark:border-white/20 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm text-main transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/50"
													placeholder="Confirm new password"
													required
													minLength={6}
													disabled={isChangingPasswordLoading}
												/>
											</div>
										</div>

										<div className="flex gap-3">
											<button
												type="submit"
												disabled={isChangingPasswordLoading}
												className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
											>
												{isChangingPasswordLoading ? (
													<>
														<ArrowPathIcon className="w-5 h-5 animate-spin" />
														Changing...
													</>
												) : (
													<>
														<ShieldCheckIcon className="w-5 h-5" />
														Change Password
													</>
												)}
											</button>
											<button
												type="button"
												onClick={handleCancelPasswordChange}
												disabled={isChangingPasswordLoading}
												className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
											>
												<XCircleIcon className="w-5 h-5" />
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
				<div className="xl:col-span-3 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-700 rounded-3xl p-8 shadow-lg">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
							<ExclamationTriangleIcon className="w-8 h-8 text-white" />
						</div>
						<div>
							<h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
							<p className="text-red-500 dark:text-red-300">
								Permanently delete your account and all data
							</p>
						</div>
					</div>

					<div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 mb-6 backdrop-blur-sm">
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
							This action will permanently delete your account and all associated data including:
						</p>
						<ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-4">
							<li className="flex items-center gap-3">
								<div className="w-2 h-2 bg-red-400 rounded-full"></div>
								All GPA calculation profiles
							</li>
							<li className="flex items-center gap-3">
								<div className="w-2 h-2 bg-red-400 rounded-full"></div>
								All shared profiles and collaboration data
							</li>
							<li className="flex items-center gap-3">
								<div className="w-2 h-2 bg-red-400 rounded-full"></div>
								Account information and settings
							</li>
							<li className="flex items-center gap-3">
								<div className="w-2 h-2 bg-red-400 rounded-full"></div>
								All stored preferences
							</li>
						</ul>
						<div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
							<p className="text-red-800 dark:text-red-200 font-semibold text-center">
								⚠️ This action cannot be undone. Make sure you have backed up any important data before
								proceeding.
							</p>
						</div>
					</div>

					<button
						onClick={() => setShowDeleteModal(true)}
						disabled={isDeletingData}
						className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 group"
					>
						{isDeletingData ? (
							<>
								<ArrowPathIcon className="w-6 h-6 animate-spin" />
								Deleting Account...
							</>
						) : (
							<>
								<TrashIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
								Delete Account & All Data
							</>
						)}
					</button>
				</div>
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
							{isGoogleUser() && hasPassword() && (
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
											setShowPasswordConfirmModal(false);
											setDeleteConfirmPassword("");
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
									onClick={handleCancelPasswordConfirm}
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
