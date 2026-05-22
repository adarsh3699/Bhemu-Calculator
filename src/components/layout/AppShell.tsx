"use client";

import React, { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

const NO_LAYOUT_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/onboarding", "/"];

export default function AppShell({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const pathname = usePathname();

	const showLayout = !NO_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

	const openSidebar = useCallback(() => setSidebarOpen(true), []);
	const closeSidebar = useCallback(() => setSidebarOpen(false), []);

	if (!showLayout) {
		return <>{children}</>;
	}

	return (
		<>
			<SideBar isOpen={sidebarOpen} onClose={closeSidebar} />
			<TopBar onMenuOpen={openSidebar} />
			<main className="md:ml-[250px] lg:ml-[280px] pt-16 min-h-screen">
				{children}
			</main>
		</>
	);
}
