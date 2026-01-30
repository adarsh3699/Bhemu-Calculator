import React from "react";
import { Link } from "react-router-dom";
import {
	UserIcon,
	ShieldCheckIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon,
	XCircleIcon,
	PencilIcon,
	ArrowPathIcon,
	CalculatorIcon,
} from "@heroicons/react/24/outline";

const AccountInfo = ({
	currentUser,
	isEditingName,
	setIsEditingName,
	newDisplayName,
	setNewDisplayName,
	isUpdatingName,
	handleUpdateDisplayName,
	handleCancelEdit,
	isGoogleUser,
}) => {
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

	return (
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
						{isGoogleUser ? (
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
				{!isGoogleUser && (
					<div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
									<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
	);
};

export default AccountInfo;
