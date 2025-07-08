import React from "react";

// Modal Icons
export const ModalCloseIcon = ({ width = 25, height = 25, ...props }) => (
	<svg
		width={width}
		height={height}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

// Consolidated modal message icons (removing duplicates from messageIcons)
export const ModalSuccessIcon = ({ width = 24, height = 24, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
	</svg>
);

export const ModalWarningIcon = ({ width = 24, height = 24, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
	</svg>
);

export const ModalInfoIcon = ({ width = 24, height = 24, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
	</svg>
);
