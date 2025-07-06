import React from "react";
import emailIconImg from "../assets/soical_logos/email.svg";
import telegramIconImg from "../assets/soical_logos/telegram.svg";
import linkedinLogoImg from "../assets/soical_logos/linkedin.svg";
import instaIconImg from "../assets/soical_logos/instagram.svg";
import youtubeIconImg from "../assets/soical_logos/youtube.svg";
import websiteIconImg from "../assets/soical_logos/website.svg";

import "../styles/aboutDeveloper.css";

function AboutDeveloper() {
	return (
		<div id="aboutDeveloper">
			<a
				href="https://www.bhemu.me/about"
				target="_blank"
				className="aboutdeveloperTitle"
				rel="noreferrer"
				aria-label="Learn more about the developer"
			>
				About Developer
			</a>

			<section className="about-content">
				<div className="aboutPoints">
					My name is <b>Adarsh Suman</b> and I'm a passionate programmer and computer geek.
				</div>
				<div className="aboutPoints">
					I have skills in web application development as a full-stack developer.
				</div>
				<div className="aboutPoints">I have more than two years of experience in this industry.</div>
				<div className="aboutPoints">
					I have experience in <b>JavaScript, React, Node.js, MySQL, MongoDB, MERN stack, PHP, HTML, CSS</b>{" "}
					and more.
				</div>
				<div className="aboutPoints">
					<a
						href="https://www.bhemu.me/about"
						target="_blank"
						rel="noreferrer"
						aria-label="Visit my website to know more"
					>
						Click here
					</a>{" "}
					to know more about my work and projects.
				</div>
			</section>

			<section id="contact">
				<div className="contact-follow-container">
					<div className="contact-section">
						<div className="subTitle">Contact Me</div>
						<div className="social-links-container">
							<a
								href="https://www.bhemu.me/contact"
								target="_blank"
								rel="noreferrer"
								className="socialLinksBox"
								aria-label="Visit my portfolio website"
							>
								<img src={websiteIconImg} alt="Website icon" />
								<div>Portfolio Website</div>
							</a>
							<a
								href="https://mail.google.com/mail/?view=cm&fs=1&to=adarsh3699@gmail.com"
								target="_blank"
								rel="noreferrer"
								className="socialLinksBox"
								aria-label="Send email to adarsh3699@gmail.com"
							>
								<img src={emailIconImg} alt="Email icon" />
								<div>adarsh3699@gmail.com</div>
							</a>
							<a
								href="https://mail.google.com/mail/?view=cm&fs=1&to=bhemu369@gmail.com"
								target="_blank"
								rel="noreferrer"
								className="socialLinksBox"
								aria-label="Send email to bhemu369@gmail.com"
							>
								<img src={emailIconImg} alt="Email icon" />
								<div>bhemu369@gmail.com</div>
							</a>
							<a
								href="https://t.me/adarsh3699"
								target="_blank"
								className="socialLinksBox"
								rel="noreferrer"
								aria-label="Contact via Telegram"
							>
								<img src={telegramIconImg} alt="Telegram icon" />
								<div>Telegram</div>
							</a>
						</div>
					</div>

					<div className="follow-section">
						<div className="subTitle">Follow Me</div>
						<div className="social-links-container">
							<a
								href="https://www.linkedin.com/in/adarsh3699/"
								target="_blank"
								className="socialLinksBox"
								rel="noreferrer"
								aria-label="Connect on LinkedIn"
							>
								<img src={linkedinLogoImg} alt="LinkedIn icon" />
								<div>LinkedIn</div>
							</a>
							<a
								href="https://www.instagram.com/_adarsh.s/"
								target="_blank"
								className="socialLinksBox"
								rel="noreferrer"
								aria-label="Follow on Instagram"
							>
								<img src={instaIconImg} alt="Instagram icon" />
								<div>Instagram</div>
							</a>
							<a
								href="https://www.youtube.com/@CodingWithBhemu"
								target="_blank"
								className="socialLinksBox"
								rel="noreferrer"
								aria-label="Subscribe to YouTube channel"
							>
								<img src={youtubeIconImg} alt="YouTube icon" />
								<div>YouTube</div>
							</a>
							<a
								href="https://github.com/adarsh3699"
								target="_blank"
								className="socialLinksBox"
								rel="noreferrer"
								aria-label="View GitHub profile"
							>
								<svg height="24" width="24" viewBox="0 0 16 16" version="1.1" id="git">
									<path
										className="githubLogo"
										fillRule="evenodd"
										d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
									></path>
								</svg>
								<div>GitHub</div>
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default AboutDeveloper;
