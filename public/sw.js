// Basic Service Worker for Bhemu Calculator
// This provides offline functionality and caching for better performance

const CACHE_NAME = "bhemu-calculator-v1";
const urlsToCache = [
	"/",
	"/static/js/bundle.js",
	"/static/css/main.css",
	"/manifest.json",
	"/newLogo192.webp",
	"/newLogo512.webp",
];

// Install event - cache resources
self.addEventListener("install", function (event) {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(function (cache) {
				return cache.addAll(urlsToCache);
			})
			.catch(function (error) {
				// Silent error handling
			})
	);
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", function (event) {
	event.respondWith(
		caches.match(event.request).then(function (response) {
			// Return cached version or fetch from network
			if (response) {
				return response;
			}
			return fetch(event.request);
		})
	);
});

// Activate event - clean up old caches
self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches.keys().then(function (cacheNames) {
			return Promise.all(
				cacheNames.map(function (cacheName) {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});
