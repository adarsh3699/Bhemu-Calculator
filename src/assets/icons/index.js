// Import all icons from categorized files
import { CloseIcon, EditIcon, DeleteIcon, PlusIcon, UserIcon, InfoIcon, CheckIcon } from "./navigationIcons";

import { ShareIcon, CopyIcon, UnshareIcon } from "./sharingIcons";

import { SuccessIcon, ErrorIcon, WarningIcon, InfoMessageIcon, MessageCloseIcon } from "./messageIcons";

import { ModalCloseIcon, ModalSuccessIcon, ModalWarningIcon, ModalInfoIcon } from "./modalIcons";

import { GoogleIcon, EyeIcon, EyeOffIcon } from "./authIcons";

import { GitHubIcon } from "./socialIcons";

// Export all icons for backward compatibility
export {
	// Navigation Icons
	CloseIcon,
	EditIcon,
	DeleteIcon,
	PlusIcon,
	UserIcon,
	InfoIcon,
	CheckIcon,

	// Sharing Icons
	ShareIcon,
	CopyIcon,
	UnshareIcon,

	// Message Icons
	SuccessIcon,
	ErrorIcon,
	WarningIcon,
	InfoMessageIcon,
	MessageCloseIcon,

	// Modal Icons
	ModalCloseIcon,
	ModalSuccessIcon,
	ModalWarningIcon,
	ModalInfoIcon,

	// Auth Icons
	GoogleIcon,
	EyeIcon,
	EyeOffIcon,

	// Social Icons
	GitHubIcon,
};

// Backward compatibility aliases for renamed icons
export const DangerIcon = ModalSuccessIcon; // This was actually a success icon based on the path
export const WarningModalIcon = ModalWarningIcon;
export const InfoModalIcon = ModalInfoIcon;
