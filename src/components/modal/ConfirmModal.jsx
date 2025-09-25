import React from "react";
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import BaseModal from "./BaseModal";

const ConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Delete",
	cancelText = "Cancel",
	type = "danger", // 'danger', 'warning', 'info'
}) => {
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	const getIcon = () => {
		switch (type) {
			case "danger":
				return <ExclamationTriangleIcon className="w-8 h-8" />;
			case "warning":
				return <ExclamationTriangleIcon className="w-8 h-8" />;
			case "info":
				return <InformationCircleIcon className="w-8 h-8" />;
			case "success":
				return <CheckCircleIcon className="w-8 h-8" />;
			default:
				return <InformationCircleIcon className="w-8 h-8" />;
		}
	};

	const getIconClasses = () => {
		switch (type) {
			case "danger":
				return "bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-500 border-2 border-red-500/30";
			case "warning":
				return "bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-500 border-2 border-amber-500/30";
			case "info":
				return "bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-500 border-2 border-blue-500/30";
			case "success":
				return "bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-500 border-2 border-green-500/30";
			default:
				return "bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-500 border-2 border-blue-500/30";
		}
	};

	const getButtonClasses = () => {
		switch (type) {
			case "danger":
				return "bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-500/30 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/40";
			case "warning":
				return "bg-gradient-to-r from-amber-500 to-orange-600 text-white border border-amber-500/30 hover:from-orange-600 hover:to-amber-700 hover:shadow-amber-500/40";
			case "info":
				return "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500/30 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40";
			case "success":
				return "bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-500/30 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/40";
			default:
				return "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500/30 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40";
		}
	};

	return (
		<BaseModal isOpen={isOpen} onClose={onClose} showHeader={false} maxWidth="450px" className="auth-card">
			<div className="px-6 pt-6 pb-4 text-center border-b border-main bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
				<div
					className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse ${getIconClasses()}`}
				>
					{getIcon()}
				</div>
				<h3 className="text-xl font-semibold text-main">{title}</h3>
			</div>
			<div className="px-6 py-4 text-center">
				<p className="text-lighter leading-relaxed">{message}</p>
			</div>
			<div className="flex gap-3 px-6 pb-6 justify-center">
				<button
					onClick={onClose}
					className="px-6 py-3 btn-google rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 min-w-[100px]"
				>
					{cancelText}
				</button>
				<button
					onClick={handleConfirm}
					className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg min-w-[100px] ${getButtonClasses()}`}
				>
					{confirmText}
				</button>
			</div>
		</BaseModal>
	);
};

export default ConfirmModal;
