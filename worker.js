/*
 *
 *  Pocket Lift
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the 'License');
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

// Inspired from https://github.com/GoogleChrome/airhorn
self.addEventListener('install', (event) => {
	event.waitUntil(caches.open('pocketlift').then((cache) => {
		return cache.addAll([
			'/',
			'/index.html',
			'/main.js',
			'/styles.css',
			'/bell.mp3',
			'/bossa.mp3',
		]).then(() => {
			return self.skipWaiting();
		});
	}));
});

self.addEventListener('activate',  (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
	event.respondWith(caches.match(event.request).then((response) => {
		return response || fetch(event.request);
	}));
});
