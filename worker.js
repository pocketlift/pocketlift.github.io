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

const APP_CACHE = 'app-v2';
const MEDIA_CACHE = 'media-v1';

const CACHES = {
	[ APP_CACHE ]: [
		'/',
		'/index.html',
		'/main.js',
		'/styles.css',
		'/symbola.ttf',
	],
	[ MEDIA_CACHE ]: [
		'/bell.mp3',
		'/bossa.mp3',
		'/monkey.mp3',
	],
};

const initCache = (cacheName) => {
	return self.caches.open(cacheName).then((cache) => {
		return cache.addAll(CACHES[cacheName]);
	});
};

const saveToCache = (request, response) => {
	const uri = request.url.slice(request.referrer.length - 1);
	for (let cacheName in CACHES) {
		if (CACHES[cacheName].indexOf(uri) !== -1) {
			self.caches.open(cacheName).then((cache) => {
				cache.put(request, response);
			});
			break;
		}
	}
};

self.addEventListener('install', (event) => {
	event.waitUntil(initCache(APP_CACHE));
	// No need to wait until the media files are loaded
	initCache(MEDIA_CACHE);
});

self.addEventListener('activate',  (event) => {
	event.waitUntil(self.caches.keys().then((keyList) => {
		return Promise.all(keyList.map((key) => {
			if (!CACHES.hasOwnProperty(key)) {
				return self.caches.delete(key);
			}
		}).concat(self.clients.claim()));
	}));
});

self.addEventListener('fetch', (event) => {
	event.respondWith(self.caches.match(event.request).then((response) => {
		return response || fetch(event.request).then((response) => {
			// Add to the cache the files that were not required initally
			saveToCache(event.request, response.clone());
			return response;
		});
	}));
});

