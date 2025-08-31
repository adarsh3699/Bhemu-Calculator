import React from "react";
import { Link } from "react-router-dom";
import { CheckIcon } from "../../../assets/icons";
import "./LoginRecommendation.css";

const LoginRecommendation = ({ feature = "GPA Calculator" }) => {
	return (
		<div className="login-recommendation">
			<div className="login-recommendation-card">
				<div className="login-recommendation-icon">
					<CheckIcon />
				</div>

				<div className="login-recommendation-content">
					<h2>🚀 Unlock Full {feature} Features</h2>
					<p className="login-recommendation-subtitle">
						Get access to advanced features and never lose your data!
					</p>

					<div className="login-recommendation-features">
						<div className="feature-item">
							<span className="feature-icon">☁️</span>
							<span>Cloud sync across all devices</span>
						</div>
						<div className="feature-item">
							<span className="feature-icon">🔗</span>
							<span>Share profiles with friends</span>
						</div>
						<div className="feature-item">
							<span className="feature-icon">📊</span>
							<span>Advanced analytics & insights</span>
						</div>
						<div className="feature-item">
							<span className="feature-icon">🔒</span>
							<span>Secure data backup</span>
						</div>
						<div className="feature-item">
							<span className="feature-icon">👥</span>
							<span>Multiple profile management</span>
						</div>
						<div className="feature-item">
							<span className="feature-icon">📱</span>
							<span>Access from anywhere</span>
						</div>
					</div>

					<div className="login-recommendation-actions">
						<Link to="/login" className="login-btn primary">
							<span className="btn-icon">🔐</span>
							Login to Continue
						</Link>
						<Link to="/signup" className="login-btn secondary">
							<span className="btn-icon">✨</span>
							Create Free Account
						</Link>
					</div>

					<div className="login-recommendation-note">
						<p>
							<strong>Already have an account?</strong>
							<Link to="/login"> Sign in here</Link>
						</p>
						<p className="privacy-note">
							<span className="privacy-icon">🔒</span>
							Your data is encrypted and secure with us
						</p>
					</div>
				</div>

				<div className="login-recommendation-background">
					<div className="floating-shape shape-1"></div>
					<div className="floating-shape shape-2"></div>
					<div className="floating-shape shape-3"></div>
				</div>
			</div>
		</div>
	);
};

export default LoginRecommendation;
