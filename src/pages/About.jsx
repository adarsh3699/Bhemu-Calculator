import React from "react";
import emailIconImg from "../assets/soical_logos/email.svg";
import telegramIconImg from "../assets/soical_logos/telegram.svg";
import linkedinLogoImg from "../assets/soical_logos/linkedin.svg";
import instaIconImg from "../assets/soical_logos/instagram.svg";
import youtubeIconImg from "../assets/soical_logos/youtube.svg";
import websiteIconImg from "../assets/soical_logos/website.svg";
import { GitHubIcon } from "../assets/icons";
// GitHubIcon is kept from assets since heroicons doesn't have a GitHub-specific icon

function AboutDeveloper() {
	return (
		<div className="mx-auto py-10 px-5 w-full overflow-auto box-border md:py-16 md:px-8">
			{/* Main Title */}
			<div className="block text-4xl font-bold mb-12 text-center text-gradient hover:-translate-y-0.5 transition-all duration-300 cursor-default md:text-5xl">
				About Developer
			</div>

			{/* About Content Section */}
			<section className="mb-16 max-w-4xl mx-auto">
				<div className="text-lg leading-relaxed my-4 pl-8 relative text-light text-left before:content-['•'] before:text-primary before:text-xl before:font-bold before:absolute before:left-2 before:top-0 before:leading-relaxed md:text-xl">
					My name is <b className="text-main font-semibold">Adarsh Suman</b> and I'm a passionate programmer
					and computer geek.
				</div>
				<div className="text-lg leading-relaxed my-4 pl-8 relative text-light text-left before:content-['•'] before:text-primary before:text-xl before:font-bold before:absolute before:left-2 before:top-0 before:leading-relaxed md:text-xl">
					I have skills in web application development as a full-stack developer.
				</div>
				<div className="text-lg leading-relaxed my-4 pl-8 relative text-light text-left before:content-['•'] before:text-primary before:text-xl before:font-bold before:absolute before:left-2 before:top-0 before:leading-relaxed md:text-xl">
					I have more than two years of experience in this industry.
				</div>
				<div className="text-lg leading-relaxed my-4 pl-8 relative text-light text-left before:content-['•'] before:text-primary before:text-xl before:font-bold before:absolute before:left-2 before:top-0 before:leading-relaxed md:text-xl">
					I have experience in{" "}
					<b className="text-main font-semibold">
						JavaScript, React, Node.js, MySQL, MongoDB, MERN stack, PHP, HTML, CSS
					</b>{" "}
					and more.
				</div>
				<div className="text-lg leading-relaxed my-4 pl-8 relative text-light text-left before:content-['•'] before:text-primary before:text-xl before:font-bold before:absolute before:left-2 before:top-0 before:leading-relaxed md:text-xl">
					<a
						href="https://www.bhemu.me/about"
						target="_blank"
						rel="noreferrer"
						aria-label="Visit my website to know more"
						className="text-primary no-underline transition-all duration-300 hover:text-primary-bright hover:underline"
					>
						Click here
					</a>{" "}
					to know more about my work and projects.
				</div>
			</section>

			{/* Contact Section */}
			<section className="mb-16 pt-12">
				<div className="flex gap-16 justify-center items-start max-w-6xl mx-auto flex-col lg:flex-row lg:gap-8">
					{/* Contact Me Section */}
					<div className="flex-1 max-w-lg min-w-0 w-full lg:min-w-80">
						<div className="text-3xl font-semibold text-main mb-8 mt-0 text-center relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-gradient-to-r after:from-primary after:to-primary-hover after:rounded-sm md:text-4xl">
							Contact Me
						</div>
						<div className="flex flex-col gap-3">
							<a
								href="https://www.bhemu.me/contact"
								target="_blank"
								rel="noreferrer"
								className="flex items-center px-7 py-5 bg-gray-100 dark:bg-white/8 border border-gray-300 dark:border-white/15 rounded-2xl transition-all duration-300 no-underline text-main backdrop-blur-sm relative overflow-hidden hover:bg-gray-200 dark:hover:bg-white/12 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
								aria-label="Visit my portfolio website"
							>
								<img
									src={websiteIconImg}
									alt="Website icon"
									className="h-7 w-7 mr-4 rounded-full transition-transform duration-300 hover:scale-110 hover:rotate-2"
								/>
								<div className="text-lg font-medium">Portfolio Website</div>
							</a>
							<a
								href="https://mail.google.com/mail/?view=cm&fs=1&to=adarsh3699@gmail.com"
								target="_blank"
								rel="noreferrer"
								className="flex items-center px-7 py-5 bg-gray-100 dark:bg-white/8 border border-gray-300 dark:border-white/15 rounded-2xl transition-all duration-300 no-underline text-main backdrop-blur-sm relative overflow-hidden hover:bg-gray-200 dark:hover:bg-white/12 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
								aria-label="Send email to adarsh3699@gmail.com"
							>
								<img
									src={emailIconImg}
									alt="Email icon"
									className="h-7 w-7 mr-4 rounded-full transition-transform duration-300 hover:scale-110 hover:rotate-2"
								/>
								<div className="text-lg font-medium">adarsh3699@gmail.com</div>
							</a>
							<a
								href="https://mail.google.com/mail/?view=cm&fs=1&to=bhemu369@gmail.com"
								target="_blank"
								rel="noreferrer"
								className="flex items-center px-7 py-5 bg-gray-100 dark:bg-white/8 border border-gray-300 dark:border-white/15 rounded-2xl transition-all duration-300 no-underline text-main backdrop-blur-sm relative overflow-hidden hover:bg-gray-200 dark:hover:bg-white/12 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
								aria-label="Send email to bhemu369@gmail.com"
							>
								<img
									src={emailIconImg}
									alt="Email icon"
									className="h-7 w-7 mr-4 rounded-full transition-transform duration-300 hover:scale-110 hover:rotate-2"
								/>
								<div className="text-lg font-medium">bhemu369@gmail.com</div>
							</a>
							<a
								href="https://t.me/adarsh3699"
								target="_blank"
								className="flex items-center px-7 py-5 bg-gray-100 dark:bg-white/8 border border-gray-300 dark:border-white/15 rounded-2xl transition-all duration-300 no-underline text-main backdrop-blur-sm relative overflow-hidden hover:bg-gray-200 dark:hover:bg-white/12 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
								rel="noreferrer"
								aria-label="Contact via Telegram"
							>
								<img
									src={telegramIconImg}
									alt="Telegram icon"
									className="h-7 w-7 mr-4 rounded-full transition-transform duration-300 hover:scale-110 hover:rotate-2"
								/>
								<div className="text-lg font-medium">Telegram</div>
							</a>
						</div>
					</div>

					{/* Follow Me Section */}
					<div className="flex-1 max-w-lg min-w-0 w-full lg:min-w-80">
						<div className="text-3xl font-semibold text-main mb-8 mt-0 text-center relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-gradient-to-r after:from-primary after:to-primary-hover after:rounded-sm md:text-4xl">
							Follow Me
						</div>
						<div className="flex flex-col gap-3">
							<a
								href="https://www.linkedin.com/in/adarsh3699/"
								target="_blank"
								className="flex items-center px-7 py-5 bg-gray-100 dark:bg-white/8 border border-gray-300 dark:border-white/15 rounded-2xl transition-all duration-300 no-underline text-main backdrop-blur-sm relative overflow-hidden hover:bg-gray-200 dark:hover:bg-white/12 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
								rel="noreferrer"
								aria-label="Connect on LinkedIn"
							>
								<img
									src={linkedinLogoImg}
									alt="LinkedIn icon"
									className="h-7 w-7 mr-4 rounded-full transition-transform duration-300 hover:scale-110 hover:rotate-2"
								/>
								<div className="text-lg font-medium">LinkedIn</div>
							</a>
							<a
								href="https://www.instagram.com/_adarsh.s/"
								target="_blank"
								className="flex items-center px-7 py-5 bg-gray-100 dark:bg-white/8 border border-gray-300 dark:border-white/15 rounded-2xl transition-all duration-300 no-underline text-main backdrop-blur-sm relative overflow-hidden hover:bg-gray-200 dark:hover:bg-white/12 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
								rel="noreferrer"
								aria-label="Follow on Instagram"
							>
								<img
									src={instaIconImg}
									alt="Instagram icon"
									className="h-7 w-7 mr-4 rounded-full transition-transform duration-300 hover:scale-110 hover:rotate-2"
								/>
								<div className="text-lg font-medium">Instagram</div>
							</a>
							<a
								href="https://www.youtube.com/@CodingWithBhemu"
								target="_blank"
								className="flex items-center px-7 py-5 bg-gray-100 dark:bg-white/8 border border-gray-300 dark:border-white/15 rounded-2xl transition-all duration-300 no-underline text-main backdrop-blur-sm relative overflow-hidden hover:bg-gray-200 dark:hover:bg-white/12 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
								rel="noreferrer"
								aria-label="Subscribe to YouTube channel"
							>
								<img
									src={youtubeIconImg}
									alt="YouTube icon"
									className="h-7 w-7 mr-4 rounded-full transition-transform duration-300 hover:scale-110 hover:rotate-2"
								/>
								<div className="text-lg font-medium">YouTube</div>
							</a>
							<a
								href="https://github.com/adarsh3699"
								target="_blank"
								className="flex items-center px-7 py-5 bg-gray-100 dark:bg-white/8 border border-gray-300 dark:border-white/15 rounded-2xl transition-all duration-300 no-underline text-main backdrop-blur-sm relative overflow-hidden hover:bg-gray-200 dark:hover:bg-white/12 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
								rel="noreferrer"
								aria-label="View GitHub profile"
							>
								<GitHubIcon className="fill-black dark:fill-white h-7 w-7 mr-4 fill-main transition-all duration-300 hover:scale-110 hover:rotate-2 hover:fill-primary" />
								<div className="text-lg font-medium">GitHub</div>
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default AboutDeveloper;
