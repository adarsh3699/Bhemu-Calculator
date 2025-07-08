import React from "react";
import { DangerIcon, WarningModalIcon, InfoModalIcon } from "../../../assets/icons";
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

	const getIcon = () => {
		switch (type) {
			case "danger":
				return <DangerIcon />;
			case "warning":
				return <WarningModalIcon />;
			case "info":
				return <InfoModalIcon />;
			default:
				return <InfoModalIcon />;
		}
	};

	if (!isOpen) return null;

	return (
		<div className="confirm-modal-overlay" onClick={handleOverlayClick}>
			<div className="confirm-modal">
				<div className="confirm-modal-header">
					<div className={`confirm-modal-icon ${type}`}>{getIcon()}</div>
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
