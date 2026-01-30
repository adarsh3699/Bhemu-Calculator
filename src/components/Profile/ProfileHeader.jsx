import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";

const ProfileHeader = () => {
	return (
		<div className="text-center mb-12">
			<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
				<UserIcon className="w-10 h-10 text-white" />
			</div>
			<h1 className="text-5xl font-bold text-gradient mb-4 tracking-tight">Your Profile</h1>
			<p className="text-lighter text-xl max-w-2xl mx-auto leading-relaxed">
				Manage your account settings, security preferences, and personal information
			</p>
		</div>
	);
};

export default ProfileHeader;
