import React from "react";
import emailIconImg from "../assets/soical_logos/email.svg";
import telegramIconImg from "../assets/soical_logos/telegram.svg";
import linkedinLogoImg from "../assets/soical_logos/linkedin.svg";
import instaIconImg from "../assets/soical_logos/instagram.svg";
import youtubeIconImg from "../assets/soical_logos/youtube.svg";
import websiteIconImg from "../assets/soical_logos/website.svg";
import { GitHubIcon } from "../assets/icons";

import "../styles/aboutDeveloper.css";

function AboutDeveloper() {
	return (
		<div id="aboutDeveloper">
			<div className="aboutdeveloperTitle">About Developer</div>

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
								<GitHubIcon />
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
