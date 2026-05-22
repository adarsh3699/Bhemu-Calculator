"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Briefcase, GraduationCap, BookOpen, Check, ArrowRight } from "lucide-react";

type GoalType = "placement" | "internship" | "skill-mastery";

const goals = [
	{
		id: "placement" as GoalType,
		icon: Briefcase,
		title: "Placement",
		description: "Focused on securing full-time roles. Perfect for graduating students or career switchers.",
	},
	{
		id: "internship" as GoalType,
		icon: GraduationCap,
		title: "Internship",
		description: "Focused on early-career opportunities and summer programs to build your professional foundation.",
	},
	{
		id: "skill-mastery" as GoalType,
		icon: BookOpen,
		title: "Skill Mastery",
		description:
			"Focused on general interview mastery. Sharpen your behavioral and technical communication skills.",
	},
];

export default function OnboardingPage() {
	const [selectedGoal, setSelectedGoal] = useState<GoalType>("placement");
	const router = useRouter();

	const handleContinue = () => {
		// Save goal preference and redirect to gpa-calculator
		router.push("/gpa-calculator");
	};

	return (
		<div className="min-h-screen bg-background font-sans text-white">
			{/* Progress Bar */}
			<div className="fixed top-0 left-0 w-full h-1 bg-border z-50">
				<div className="h-full bg-gradient-to-r from-primary to-accent w-1/3 rounded-full" />
			</div>

			{/* Background glows */}
			<div className="fixed top-1/4 -left-20 size-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
			<div className="fixed bottom-1/4 -right-20 size-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

			<div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
				<div className="layout-container flex h-full grow flex-col">
					{/* Navigation Bar */}
					<header className="flex items-center justify-between whitespace-nowrap border-b border-border px-10 py-4 border-neutral-800">
						<Link href="/" className="flex items-center gap-3">
							<Image src="/myLogo.webp" alt="Bhemu Calculator Logo" width={40} height={40} className="size-10 object-cover rounded-lg" />
							<h2 className="text-white text-xl font-bold tracking-tight">Bhemu Calculator</h2>
						</Link>
						<div className="flex items-center gap-4">
							<span className="text-muted-foreground text-sm font-medium">Step 1 of 3</span>
							<div className="size-10 rounded-full bg-surface-elevated border border-border overflow-hidden">
								<div className="w-full h-full bg-gradient-to-br from-primary/50 to-accent/50" />
							</div>
						</div>
					</header>

					{/* Main Content Area */}
					<main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
						<div className="max-w-[1000px] w-full flex flex-col items-center text-center">
							{/* Welcome Header Section */}
							<div className="mb-12">
								<div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-secondary text-xs font-semibold mb-6 uppercase tracking-wider">
									Personalization
								</div>
								<h1 className="text-white tracking-tight text-4xl md:text-5xl font-bold leading-tight mb-4">
									Welcome to Bhemu Calculator!
								</h1>
								<p className="text-muted-foreground text-lg max-w-xl mx-auto">
									To personalize your academic workspace journey, tell us what career milestone
									you&apos;re aiming for next.
								</p>
							</div>

							{/* Goal Selection Cards */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
								{goals.map((goal) => {
									const Icon = goal.icon;
									const isSelected = selectedGoal === goal.id;
									return (
										<button
											key={goal.id}
											onClick={() => setSelectedGoal(goal.id)}
											className={`relative flex flex-col gap-6 p-8 rounded-xl cursor-pointer group text-left transition-all duration-300 backdrop-blur-md border ${
												isSelected
													? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
													: "border-neutral-800 bg-neutral-900/30 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1"
											}`}
										>
											{/* Selected Check */}
											{isSelected && (
												<div className="absolute top-4 right-4">
													<div className="bg-primary size-6 rounded-full flex items-center justify-center">
														<Check className="size-4 text-white" />
													</div>
												</div>
											)}

											{/* Icon */}
											<div
												className={`size-16 rounded-xl flex items-center justify-center shadow-lg ${
													isSelected
														? "bg-gradient-to-r from-primary to-accent shadow-primary/20"
														: "bg-neutral-800 group-hover:bg-primary/40 transition-colors"
												}`}
											>
												<Icon className="size-8 text-white" />
											</div>

											{/* Text */}
											<div>
												<h3 className="text-white text-xl font-bold mb-2">{goal.title}</h3>
												<p className="text-muted-foreground text-sm leading-relaxed">
													{goal.description}
												</p>
											</div>
										</button>
									);
								})}
							</div>

							{/* Navigation Footer */}
							<div className="flex flex-col items-center gap-4">
								<button
									onClick={handleContinue}
									className="bg-primary hover:bg-primary/80 text-white font-bold text-lg px-12 py-4 rounded-lg transition-all shadow-xl shadow-primary/30 flex items-center gap-2 group border-none cursor-pointer"
								>
									Continue
									<ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
								</button>
								<p className="text-muted-foreground text-sm">You can change your focus later in settings.</p>
							</div>
						</div>
					</main>
				</div>
			</div>

			{/* Footer Meta */}
			<footer className="w-full py-8 text-center border-t border-neutral-800 bg-background">
				<p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.2em]">
					Bhemu Calculator • Premium Academic Planning
				</p>
			</footer>
		</div>
	);
}
