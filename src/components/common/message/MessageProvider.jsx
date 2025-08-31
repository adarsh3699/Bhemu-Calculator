import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { SuccessIcon, ErrorIcon, WarningIcon, InfoMessageIcon, MessageCloseIcon } from "../../../assets/icons";
import "./MessageSystem.css";

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

	const icons = {
		success: <SuccessIcon />,
		error: <ErrorIcon />,
		warning: <WarningIcon />,
		info: <InfoMessageIcon />,
	};

	if (!msgText) return null;

	return (
		<div className={`msg-container ${isVisible ? "show" : "hide"}`}>
			<div className={`msg-toast ${type}`}>
				<div className="msg-content">
					{icons[type] || icons.info}
					<span className="msg-text">{msgText}</span>
				</div>
				<button className="msg-close" onClick={handleClose} aria-label="Close message">
					<MessageCloseIcon />
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
