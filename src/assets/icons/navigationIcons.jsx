import React from "react";

// Navigation and UI Icons
export const CloseIcon = ({ width = 24, height = 24, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
	</svg>
);

export const EditIcon = ({ width = 20, height = 20, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
	</svg>
);

export const DeleteIcon = ({ width = 20, height = 20, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
	</svg>
);

export const PlusIcon = ({ width = 30, height = 30, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
	</svg>
);

export const UserIcon = ({ width = 30, height = 30, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
	</svg>
);

export const InfoIcon = ({ width = 15, height = 15, onClick, ...props }) => (
	<svg
		width={width}
		height={height}
		viewBox="0 0 24 24"
		fill="currentColor"
		onClick={onClick}
		style={{ cursor: onClick ? "pointer" : "default", marginLeft: "4px" }}
		role={onClick ? "button" : undefined}
		aria-label="Information"
		tabIndex={onClick ? 0 : undefined}
		{...props}
	>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
	</svg>
);

export const CheckIcon = ({ width = 24, height = 24, ...props }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
	</svg>
);
