import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/firebase/AuthContext";
import { MessageProvider } from "@/components/common/MessageProvider";
import { GpaDataProvider } from "@/hooks/GpaDataContext";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Bhemu Calculator - GPA Tracker, SGPA & CGPA Planning",
	description:
		"Track your academic progress, calculate SGPA & CGPA, plan future GPA goals, and collaborate in real-time with Bhemu Calculator.",
	keywords: [
		"Bhemu Calculator",
		"GPA Calculator",
		"SGPA Calculator",
		"CGPA Calculator",
		"Academic Tracker",
		"Grade Goal Planner",
		"Reappear Backlog Calculator"
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${inter.variable} h-full antialiased dark`}>
			<body className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
				<AuthProvider>
					<MessageProvider>
						<GpaDataProvider>
							<AppShell>{children}</AppShell>
						</GpaDataProvider>
					</MessageProvider>
				</AuthProvider>
			</body>
		</html>
	);
}

