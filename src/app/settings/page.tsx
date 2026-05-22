import React from "react";
import ProfileView from "@/components/Settings/ProfileView";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Settings | Bhemu Calculator",
	description: "Manage your account credentials, security preferences, profile data synchronization, and personal workspace settings.",
};

export default function SettingsPage() {
	return <ProfileView />;
}
