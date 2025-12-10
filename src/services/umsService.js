/**
 * UMS Service - Handles communication with the UMS Scraper backend
 */

const UMS_BASE_URL = import.meta.env.VITE_UMS_BASE_URL || "https://ums.bhemu.in";

export class UMSService {
	constructor() {
		this.baseUrl = UMS_BASE_URL;
	}

	/**
	 * Test connection to UMS Scraper backend
	 */
	async testConnection() {
		try {
			const response = await fetch(`${this.baseUrl}/ums/test`);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("UMS connection test failed:", error);
			return {
				success: false,
				error: error.message,
				message: "Failed to connect to UMS service",
			};
		}
	}

	/**
	 * Fetch student basic information from UMS
	 * @param {string} gaValue - The _ga_B0Z6G6GCD8 cookie value
	 */
	async getStudentBasicInfo(gaValue) {
		try {
			const response = await fetch(
				`${this.baseUrl}/ums/student/basic-info?_ga_B0Z6G6GCD8=${encodeURIComponent(gaValue)}`
			);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Failed to fetch student basic info:", error);
			return {
				success: false,
				error: error.message,
				message: "Failed to fetch student information",
			};
		}
	}

	/**
	 * Fetch student grades and academic data from UMS
	 * @param {string} gaValue - The _ga_B0Z6G6GCD8 cookie value
	 * @param {string} termId - Optional term ID to fetch specific term data
	 */
	async getStudentGrades(gaValue, termId = null) {
		try {
			let url = `${this.baseUrl}/ums/student/grades?_ga_B0Z6G6GCD8=${encodeURIComponent(gaValue)}`;
			if (termId) {
				url += `&term=${encodeURIComponent(termId)}`;
			}

			const response = await fetch(url);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Failed to fetch student grades:", error);
			return {
				success: false,
				error: error.message,
				message: "Failed to fetch academic data",
			};
		}
	}

	/**
	 * Get all available terms from UMS
	 * @param {string} gaValue - The _ga_B0Z6G6GCD8 cookie value
	 */
	async getAvailableTerms(gaValue) {
		try {
			const response = await fetch(
				`${this.baseUrl}/ums/student/terms?_ga_B0Z6G6GCD8=${encodeURIComponent(gaValue)}`
			);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Failed to fetch available terms:", error);
			return {
				success: false,
				error: error.message,
				message: "Failed to fetch available terms",
			};
		}
	}

	/**
	 * Validate UMS session cookie format
	 * @param {string} gaValue - The cookie value to validate
	 */
	validateCookie(gaValue) {
		if (!gaValue || typeof gaValue !== "string") {
			return {
				valid: false,
				message: "Cookie value is required",
			};
		}

		const trimmedValue = gaValue.trim();

		// Check minimum length (should be at least 10 characters)
		if (trimmedValue.length < 10) {
			return {
				valid: false,
				message: "Cookie value appears too short. Please check if you copied the complete value.",
			};
		}

		// Check for common invalid characters or patterns
		if (trimmedValue.includes(" ") || trimmedValue.includes("\n") || trimmedValue.includes("\t")) {
			return {
				valid: false,
				message: "Cookie value contains invalid whitespace characters. Please copy only the cookie value.",
			};
		}

		// For _ga_B0Z6G6GCD8 cookie, it can be alphanumeric string
		// Remove the strict GA pattern validation since UMS uses different cookie format
		const validPattern = /^[a-zA-Z0-9._-]+$/;
		if (!validPattern.test(trimmedValue)) {
			return {
				valid: false,
				message:
					"Cookie value contains invalid characters. Only letters, numbers, dots, hyphens and underscores are allowed.",
			};
		}

		return {
			valid: true,
			message: "Cookie format is valid",
		};
	}

	/**
	 * Get stored UMS term IDs from localStorage
	 * @param {string} userId - User ID to get term IDs for
	 */
	getStoredTermIds(userId) {
		try {
			const storedData = localStorage.getItem("umsTermIds");
			if (!storedData) return null;

			const allTermIds = JSON.parse(storedData);
			return allTermIds[userId] || null;
		} catch (error) {
			console.error("Failed to get stored term IDs:", error);
			return null;
		}
	}

	/**
	 * Store UMS term IDs in localStorage
	 * @param {string} userId - User ID
	 * @param {Object} termIds - Term IDs data
	 * @param {string} profileId - Profile ID associated with the data
	 */
	storeTermIds(userId, termIds, profileId) {
		try {
			const existingData = JSON.parse(localStorage.getItem("umsTermIds") || "{}");
			const updatedData = {
				...existingData,
				[userId]: {
					...termIds,
					lastUpdated: new Date().toISOString(),
					profileId: profileId,
				},
			};
			localStorage.setItem("umsTermIds", JSON.stringify(updatedData));
			return true;
		} catch (error) {
			console.error("Failed to store term IDs:", error);
			return false;
		}
	}
}

// Create a singleton instance
export const umsService = new UMSService();

// Export default
export default umsService;
