import React, { useState, useEffect } from "react";
import "./InputModal.css";

const InputModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	placeholder,
	initialValue = "",
	confirmText = "OK",
	cancelText = "Cancel",
}) => {
	const [inputValue, setInputValue] = useState(initialValue);

	useEffect(() => {
		setInputValue(initialValue);
	}, [initialValue, isOpen]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (inputValue.trim()) {
			onConfirm(inputValue.trim());
			setInputValue("");
		}
	};

	const handleCancel = () => {
		setInputValue("");
		onClose();
	};

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) {
			handleCancel();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="input-modal-overlay" onClick={handleOverlayClick}>
			<div className="input-modal">
				<div className="input-modal-header">
					<h3>{title}</h3>
				</div>
				<form onSubmit={handleSubmit} className="input-modal-form">
					<div className="input-modal-body">
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder={placeholder}
							className="input-modal-input"
						/>
					</div>
					<div className="input-modal-actions">
						<button type="button" onClick={handleCancel} className="input-modal-btn cancel-btn">
							{cancelText}
						</button>
						<button type="submit" className="input-modal-btn confirm-btn" disabled={!inputValue.trim()}>
							{confirmText}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default InputModal;
