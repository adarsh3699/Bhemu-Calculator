import React from "react";
import "./ConfirmModal.css";

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

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="confirm-modal-overlay" onClick={handleOverlayClick}>
			<div className="confirm-modal">
				<div className="confirm-modal-header">
					<div className={`confirm-modal-icon ${type}`}>
						{type === "danger" && (
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
							</svg>
						)}
						{type === "warning" && (
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
							</svg>
						)}
						{type === "info" && (
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
							</svg>
						)}
					</div>
					<h3>{title}</h3>
				</div>
				<div className="confirm-modal-body">
					<p>{message}</p>
				</div>
				<div className="confirm-modal-actions">
					<button onClick={onClose} className="confirm-modal-btn cancel-btn">
						{cancelText}
					</button>
					<button onClick={handleConfirm} className={`confirm-modal-btn confirm-btn ${type}`}>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
