import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 3000,
		open: false,
	},
	build: {
		outDir: "build",
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					// Separate vendor chunks for better caching
					"react-vendor": ["react", "react-dom"],
					"router-vendor": ["react-router-dom"],
					"firebase-vendor": ["firebase/app", "firebase/auth", "firebase/firestore"],
					"heroicons-vendor": ["@heroicons/react/24/outline", "@heroicons/react/24/solid"],
				},
			},
		},
		chunkSizeWarningLimit: 1000,
	},
	define: {
		global: "globalThis",
	},
});
