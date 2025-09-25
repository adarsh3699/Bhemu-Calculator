import React, { useEffect } from "react";
import Modal from "react-modal";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Set the app element for accessibility
if (typeof document !== "undefined") {
	Modal.setAppElement(document.getElementById("root") || document.body);
}

const BaseModal = ({
	isOpen,
	onClose,
	children,
	title,
	showHeader = true,
	showCloseButton = true,
	closeOnOverlayClick = true,
	closeOnEsc = true,
	maxWidth = "500px",
	className = "",
	overlayClassName = "",
	...otherProps
}) => {
	// Prevent background scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			// Store current scroll position
			const scrollY = window.scrollY;
			const body = document.body;
			const html = document.documentElement;

			// Apply styles to prevent scrolling
			body.style.position = "fixed";
			body.style.top = `-${scrollY}px`;
			body.style.width = "100%";
			body.style.overflow = "hidden";
			html.style.overflow = "hidden";

			// Cleanup function
			return () => {
				// Restore scroll position and remove styles
				body.style.position = "";
				body.style.top = "";
				body.style.width = "";
				body.style.overflow = "";
				html.style.overflow = "";
				window.scrollTo(0, scrollY);
			};
		}
	}, [isOpen]);

	const handleOverlayClick = (e) => {
		if (closeOnOverlayClick && e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={closeOnEsc ? onClose : undefined}
			className="fixed inset-0 flex items-center justify-center p-4 z-[1000] outline-none border-none"
			overlayClassName={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000] transition-all duration-150 ease-out border-none ${
				isOpen ? "opacity-100" : "opacity-0"
			} ${overlayClassName}`}
			closeTimeoutMS={150}
			{...otherProps}
		>
			{/* Blur overlay background */}
			<div
				className="fixed inset-0 backdrop-blur-md transition-opacity duration-150 ease-out"
				onClick={handleOverlayClick}
				aria-hidden="true"
			/>

			<div
				className={`relative w-full transition-all duration-150 ease-out z-10 border-none outline-none ${
					isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-1"
				}`}
				style={{ maxWidth }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal content with proper styling */}
				<div
					className={`rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border-none outline-none ${className}`}
				>
					{/* Uniform header - controlled by showHeader prop */}
					{showHeader && title && (
						<div className="flex items-center justify-between px-6 py-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-b border-white/15">
							<h2 className="text-xl font-semibold text-gradient">{title}</h2>
							{showCloseButton && (
								<button
									onClick={onClose}
									className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-white/70 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white/90 hover:scale-110"
									aria-label="Close modal"
								>
									<XMarkIcon className="w-5 h-5" />
								</button>
							)}
						</div>
					)}

					{/* Content */}
					<div className="flex-1 overflow-auto bg-[#2a2b2df2]">{children}</div>
				</div>
			</div>
		</Modal>
	);
};

export default BaseModal;
