"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/firebase/AuthContext";
import { useMessage } from "@/components/common/MessageProvider";
import {
	Menu,
	LogOut,
	Info,
	ChevronRight,
	Settings,
} from "lucide-react";

// Map route segments to display names
const PAGE_LABELS: Record<string, string> = {
	dashboard: "Dashboard",
	"gpa-calculator": "GPA Calculator",
	"reappear-calculator": "Reappear Calculator",
	"gpa-goal-planner": "Goal Planner",
	settings: "Settings",
	about: "About",
};

interface TopBarProps {
	onMenuOpen: () => void;
}

export default function TopBar({ onMenuOpen }: TopBarProps) {
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);

	const pathname = usePathname();
	const router = useRouter();
	const { currentUser, logout } = useAuth();
	const { showMessage } = useMessage();

	const currentSegment = pathname.split("/")[1] || "gpa-calculator";
	const pageLabel = PAGE_LABELS[currentSegment] ?? "Dashboard";

	// Close profile dropdown on outside click
	useEffect(() => {
		const handle = (e: MouseEvent) => {
			if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
				setIsProfileOpen(false);
			}
		};
		document.addEventListener("mousedown", handle);
		return () => document.removeEventListener("mousedown", handle);
	}, []);

	const getUserInitial = useCallback(() => {
		if (!currentUser) return "U";
		const name = currentUser.displayName || currentUser.email;
		return name ? name.charAt(0).toUpperCase() : "U";
	}, [currentUser]);

	const handleLogout = useCallback(async () => {
		setIsProfileOpen(false);
		try {
			await logout();
			showMessage("Logged out successfully.", "info");
			router.push("/login");
		} catch (err) {
			console.error("Logout error:", err);
			showMessage("Logout failed.", "error");
		}
	}, [logout, showMessage, router]);

	return (
		<header className="fixed top-0 right-0 w-full md:w-[calc(100%-250px)] lg:w-[calc(100%-280px)] h-16 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-[80]">
			{/* Left: hamburger (mobile) + breadcrumb */}
			<div className="flex items-center gap-3">
				<button
					onClick={onMenuOpen}
					className="md:hidden p-2 rounded-lg border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
					aria-label="Open sidebar"
				>
					<Menu className="w-5 h-5" />
				</button>

				{/* Breadcrumb */}
				<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<span className="hidden sm:inline">Dashboard</span>
					<ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
					<span className="font-semibold text-primary">{pageLabel}</span>
				</div>
			</div>

			{/* Right: actions */}
			<div className="flex items-center gap-2">


				{/* Profile */}
				{currentUser ? (
					<div className="relative" ref={profileRef}>
						<button
							onClick={() => setIsProfileOpen((p) => !p)}
							className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm border border-white/10 hover:ring-2 hover:ring-primary/40 transition-all"
							title="Profile menu"
						>
							{getUserInitial()}
						</button>

						{isProfileOpen && (
							<div className="absolute top-10 right-0 w-52 bg-neutral-900 border border-white/8 rounded-xl shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
								{/* User info header */}
								<div className="px-4 py-3 border-b border-white/5 bg-neutral-950/60">
									<p className="text-white text-sm font-semibold truncate">
										{currentUser.displayName || "User"}
									</p>
									<p className="text-muted-foreground text-xs truncate mt-0.5">
										{currentUser.email}
									</p>
								</div>
								<div className="p-1">
									<button
										onClick={() => { setIsProfileOpen(false); router.push("/settings"); }}
										className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-all"
									>
										<Settings className="w-4 h-4 text-neutral-400" />
										Settings
									</button>
									<button
										onClick={() => { setIsProfileOpen(false); router.push("/about"); }}
										className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-all"
									>
										<Info className="w-4 h-4 text-neutral-400" />
										About
									</button>
									<button
										onClick={handleLogout}
										className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/20 transition-all"
									>
										<LogOut className="w-4 h-4" />
										Sign Out
									</button>
								</div>
							</div>
						)}
					</div>
				) : (
					<button
						onClick={() => router.push("/login")}
						className="text-sm font-semibold bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg transition-all"
					>
						Sign In
					</button>
				)}
			</div>
		</header>
	);
}
