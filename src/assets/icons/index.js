// Only import icons that are still needed (not replaced by heroicons)
import { GoogleIcon } from "./authIcons";
import { GitHubIcon } from "./socialIcons";

// Export only the icons that are still being used
export {
	// Auth Icons - GoogleIcon is kept for its specific branding colors
	GoogleIcon,

	// Social Icons - GitHubIcon is kept as heroicons doesn't have GitHub-specific branding
	GitHubIcon,
};

// Note: Most icons have been replaced with Heroicons for consistency
// Only brand-specific icons (Google, GitHub) are kept from the custom icon set
