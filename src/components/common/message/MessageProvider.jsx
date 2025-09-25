import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Message display component
const MessageDisplay = ({ msgText, type = "info", duration = 8000, onClose }) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				setIsVisible(false);
				setTimeout(onClose, 300); // Wait for fade out animation
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [duration, onClose]);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(onClose, 300);
	};

	const getToastStyles = (type) => {
		const baseStyles =
			"flex items-center justify-between p-3 rounded-lg shadow-lg min-w-[300px] max-w-md text-white text-sm font-medium backdrop-blur-sm border";

		switch (type) {
			case "success":
				return `${baseStyles} bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-500/30`;
			case "error":
				return `${baseStyles} bg-gradient-to-r from-red-500 to-red-600 border-red-500/30`;
			case "warning":
				return `${baseStyles} bg-gradient-to-r from-amber-500 to-amber-600 border-amber-500/30 text-gray-900`;
			case "info":
			default:
				return `${baseStyles} bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500/30`;
		}
	};

	const icons = {
		success: <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />,
		error: <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />,
		warning: <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />,
		info: <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />,
	};

	if (!msgText) return null;

	return (
		<div
			className={`fixed top-12 right-5 z-[10000] transition-all duration-300 ease-in-out max-md:top-3 max-md:right-3 max-md:left-3 ${
				isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
			}`}
		>
			<div className={getToastStyles(type)}>
				<div className="flex items-center gap-3 flex-1">
					{icons[type] || icons.info}
					<span className="break-words leading-relaxed">{msgText}</span>
				</div>
				<button
					className={`p-1 rounded border-none cursor-pointer flex items-center justify-center ml-2 opacity-70 transition-opacity duration-200 hover:opacity-100 hover:bg-white/10 ${
						type === "warning" ? "text-gray-900" : "text-white"
					}`}
					onClick={handleClose}
					aria-label="Close message"
				>
					<XMarkIcon className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
};

// Create message context
const MessageContext = createContext();

// Custom hook to use message context
export const useMessage = () => {
	const context = useContext(MessageContext);
	if (!context) {
		throw new Error("useMessage must be used within a MessageProvider");
	}
	return context;
};

// Message provider component
export const MessageProvider = ({ children }) => {
	const [msg, setMsg] = useState({ text: "", type: "" });

	const showMessage = useCallback((msgText, type = "info") => {
		if (msgText) {
			setMsg({ text: msgText, type });
		}
	}, []);

	const clearMessage = useCallback(() => {
		setMsg({ text: "", type: "" });
	}, []);

	return (
		<MessageContext.Provider value={{ showMessage, clearMessage }}>
			{children}
			{msg.text && <MessageDisplay msgText={msg.text} type={msg.type} onClose={clearMessage} />}
		</MessageContext.Provider>
	);
};
