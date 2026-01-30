import React from "react";
import { ExclamationTriangleIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const DangerZone = ({ onShowDeleteModal, isDeletingData }) => {
	return (
		<div className="xl:col-span-3 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-700 rounded-3xl p-8 shadow-lg">
			<div className="flex items-center gap-4 mb-6">
				<div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
					<ExclamationTriangleIcon className="w-8 h-8 text-white" />
				</div>
				<div>
					<h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
					<p className="text-red-500 dark:text-red-300">Permanently delete your account and all data</p>
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
				onClick={onShowDeleteModal}
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
	);
};

export default DangerZone;
