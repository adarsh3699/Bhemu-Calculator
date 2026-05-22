"use client";

/**
 * SemesterRoadmap — vertical timeline of all semesters with SGPA & credits.
 *
 * DesignPrinciples:
 *  §11 SRP  — one job: render the semester progression timeline
 *  §2  Low Coupling — receives GPASemester[]; no auth, no Firebase
 *  §16 Pure data — sgpa + credits derived inline from props
 */

import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import type { GPASemester } from "@/types";
import { calculateGPA } from "@/utils/gpaUtils";

interface Props {
	semesters: GPASemester[];
}

export default function SemesterRoadmap({ semesters }: Props) {
	if (semesters.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
				<CalendarDays className="w-10 h-10 opacity-30" />
				<p className="text-sm text-center">Add your first semester to see the roadmap.</p>
				<Link href="/gpa-calculator" className="text-xs text-primary hover:underline flex items-center gap-1">
					Go to GPA Calculator <ArrowRight className="w-3 h-3" />
				</Link>
			</div>
		);
	}

	return (
		<div className="relative pl-4 space-y-5 before:absolute before:inset-y-0 before:left-[21px] before:w-px before:bg-border">
			{semesters.map((sem, i) => {
				const isActive = i === semesters.length - 1;
				const sgpa = parseFloat(calculateGPA(sem.subjects));
				const credits = sem.subjects.reduce((acc, s) => acc + (s.credit || 0), 0);

				return (
					<div
						key={sem.id}
						className={`relative flex gap-4 items-start ${!isActive ? "opacity-80 hover:opacity-100 transition-opacity" : ""}`}
					>
						{/* Timeline dot */}
						{isActive ? (
							<div className="absolute -left-[9px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary z-10 flex items-center justify-center shadow-[0_0_10px_rgba(117,209,255,0.4)]">
								<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
							</div>
						) : (
							<div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-surface-elevated border-2 border-border z-10" />
						)}

						{/* Card */}
						<div
							className={`flex-1 rounded-lg p-4 ml-6 transition-colors ${
								isActive
									? "bg-gradient-to-br from-surface-elevated to-surface-dark border border-primary/30 shadow-[0_4px_20px_-5px_rgba(117,209,255,0.12)]"
									: "bg-surface-elevated/40 border border-border hover:bg-surface-elevated/80"
							}`}
						>
							<div className="flex justify-between items-center mb-1">
								<h4 className={`font-semibold text-sm ${isActive ? "text-primary" : "text-white"}`}>
									{sem.name}
								</h4>
								{isActive ? (
									<span className="bg-primary/15 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-primary/20 tracking-wide">
										Active
									</span>
								) : (
									<span className="text-[11px] text-muted-foreground">Completed</span>
								)}
							</div>
							<div className="flex gap-4 text-xs text-muted-foreground mt-1">
								<span>SGPA: <span className="text-white font-medium">{sgpa > 0 ? sgpa.toFixed(2) : "—"}</span></span>
								<span>Credits: <span className="text-white font-medium">{credits}</span></span>
							</div>
							{isActive && (
								<div className="mt-3 pt-3 border-t border-white/5">
									<Link href="/gpa-calculator" className="text-xs text-white/70 hover:text-primary transition-colors flex items-center gap-1">
										Manage subjects <ArrowRight className="w-3 h-3" />
									</Link>
								</div>
							)}
						</div>
					</div>
				);
			})}

			{/* Upcoming placeholder */}
			<div className="relative flex gap-4 items-start opacity-40">
				<div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-surface-elevated border-2 border-dashed border-border z-10" />
				<div className="flex-1 border border-dashed border-border rounded-lg p-4 ml-6">
					<h4 className="text-xs font-medium text-muted-foreground">Semester {semesters.length + 1}</h4>
					<div className="text-[11px] text-muted-foreground/60 mt-0.5">Upcoming</div>
				</div>
			</div>
		</div>
	);
}
