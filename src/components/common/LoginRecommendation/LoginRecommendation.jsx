import React from "react";
import { Link } from "react-router-dom";
import { CheckIcon } from "@heroicons/react/24/solid";

const LoginRecommendation = ({ feature = "GPA Calculator" }) => {
	return (
		<div className="w-full min-h-screen flex items-center justify-center p-5 relative">
			<div className="auth-card backdrop-blur-xl rounded-3xl p-10 max-w-2xl w-full shadow-2xl border border-white/20 relative text-center overflow-hidden">
				{/* Top gradient line */}
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"></div>

				{/* Icon */}
				<div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse duration-[3000ms] shadow-lg shadow-indigo-500/30">
					<CheckIcon className="w-10 h-10 text-white" />
				</div>

				{/* Content */}
				<div>
					<h2 className="text-4xl font-bold text-gradient mb-4 tracking-tight">
						🚀 Unlock Full {feature} Features
					</h2>
					<p className="text-xl text-lighter mb-10 font-normal leading-relaxed">
						Get access to advanced features and never lose your data!
					</p>

					{/* Features Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
						{[
							{ icon: "☁️", text: "Cloud sync across all devices" },
							{ icon: "🔗", text: "Share profiles with friends" },
							{ icon: "📊", text: "Advanced analytics & insights" },
							{ icon: "🔒", text: "Secure data backup" },
							{ icon: "👥", text: "Multiple profile management" },
							{ icon: "📱", text: "Access from anywhere" },
						].map((feature, index) => (
							<div
								key={index}
								className={`flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/20 transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4`}
								style={{ animationDelay: `${(index + 1) * 100}ms` }}
							>
								<span className="text-2xl min-w-[24px]">{feature.icon}</span>
								<span className="text-white/90 font-medium text-sm">{feature.text}</span>
							</div>
						))}
					</div>

					{/* Action Buttons */}
					<div className="flex gap-5 justify-center mb-8 flex-wrap">
						<Link
							to="/login"
							className="relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold text-lg tracking-wide uppercase min-w-[180px] justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/40 overflow-hidden group"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
							<span className="text-xl">🔐</span>
							<span className="relative">Login to Continue</span>
						</Link>
						<Link
							to="/signup"
							className="relative inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white/90 border border-white/30 rounded-2xl font-semibold text-lg tracking-wide uppercase min-w-[180px] justify-center transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 overflow-hidden group"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
							<span className="text-xl">✨</span>
							<span className="relative">Create Free Account</span>
						</Link>
					</div>

					{/* Note Section */}
					<div className="mt-8 pt-8 border-t border-white/10">
						<p className="text-lighter mb-3 text-sm">
							<strong className="text-white/90">Already have an account?</strong>
							<Link
								to="/login"
								className="text-indigo-400 font-semibold ml-1 hover:text-indigo-300 transition-colors"
							>
								Sign in here
							</Link>
						</p>
						<p className="flex items-center justify-center gap-2 text-lighter text-sm">
							<span className="text-base">🔒</span>
							Your data is encrypted and secure with us
						</p>
					</div>
				</div>

				{/* Floating Background Shapes */}
				<div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
					<div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-full blur-xl animate-bounce duration-[4000ms]"></div>
					<div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-full blur-xl animate-bounce duration-[5000ms] delay-1000"></div>
					<div className="absolute bottom-10 left-1/2 w-12 h-12 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-xl animate-bounce duration-[6000ms] delay-2000"></div>
				</div>
			</div>
		</div>
	);
};

export default LoginRecommendation;
