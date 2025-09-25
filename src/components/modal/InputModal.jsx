import React, { useState, useEffect } from "react";
import BaseModal from "./BaseModal";

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

	return (
		<BaseModal
			isOpen={isOpen}
			onClose={handleCancel}
			title={title}
			maxWidth="400px"
			showCloseButton={false}
			className="auth-card"
		>
			<form onSubmit={handleSubmit} className="flex flex-col">
				<div className="p-6">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder={placeholder}
						className="w-full p-4 border-2 border-indigo-500/30 rounded-xl bg-white/5 text-main transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-lighter"
						autoFocus
						required
					/>
				</div>
				<div className="flex gap-3 px-6 pb-6 justify-end max-sm:flex-col">
					<button
						type="button"
						onClick={handleCancel}
						className="btn-google px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 min-w-[80px] max-sm:w-full"
					>
						{cancelText}
					</button>
					<button
						type="submit"
						disabled={!inputValue.trim()}
						className="btn-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none min-w-[80px] max-sm:w-full"
					>
						{confirmText}
					</button>
				</div>
			</form>
		</BaseModal>
	);
};

export default InputModal;
