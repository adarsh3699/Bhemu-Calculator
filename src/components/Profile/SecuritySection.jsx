import React from "react";
import { LockClosedIcon, KeyIcon, ShieldCheckIcon, ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const SecuritySection = ({
	isGoogleUser,
	hasPassword,
	isCreatingPassword,
	setIsCreatingPassword,
	newPassword,
	setNewPassword,
	confirmPassword,
	setConfirmPassword,
	isSettingPassword,
	handleCreatePassword,
	handleCancelPassword,
	isChangingPassword,
	setIsChangingPassword,
	currentPassword,
	setCurrentPassword,
	isChangingPasswordLoading,
	handleChangePassword,
	handleCancelPasswordChange,
}) => {
	return (
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
			{!hasPassword && (
				<div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-700 mb-6">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
							<ExclamationTriangleIcon className="w-5 h-5 text-white" />
						</div>
						<div>
							<p className="font-semibold text-amber-800 dark:text-amber-200">No Password Set</p>
							<p className="text-xs text-amber-600 dark:text-amber-300">
								Consider setting up a password for additional security
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Create Password for Google Users */}
			{isGoogleUser && !hasPassword && (
				<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-700 shadow-lg">
					{!isCreatingPassword ? (
						<div className="text-center space-y-6">
							<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
								<KeyIcon className="w-8 h-8 text-white" />
							</div>
							<div>
								<h4 className="text-2xl font-bold text-gradient mb-3">Create Password</h4>
								<p className="text-gray-600 dark:text-gray-300 leading-relaxed">
									Set up a password to enable email/password login for your account and enhance
									security
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
									<label htmlFor="set-new-password" className="block font-semibold text-main mb-2">
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
			{hasPassword && (
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
									<label htmlFor="current-password" className="block font-semibold text-main mb-2">
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
									<label htmlFor="change-new-password" className="block font-semibold text-main mb-2">
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
	);
};

export default SecuritySection;
