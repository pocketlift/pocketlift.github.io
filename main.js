/*
 *
 *  Air Horner
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
(function () {
	// Inspired from https://github.com/GoogleChrome/airhorn

	'use strict';

	var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	var playButton = document.getElementById('play');
	var musicBuffer = loadAudio('bossa.mp3');
	var bellBuffer = loadAudio('bell.mp3');
	var startTimeStamp;
	var source;
	var sourceId = 0;

	playButton.addEventListener('mousedown', handleDown);
	playButton.addEventListener('touchstart', handleDown);

	document.documentElement.addEventListener('mouseup', handleUp);
	document.documentElement.addEventListener('touchend', handleUp);

	function handleDown(event) {
		event.preventDefault();
		if(event.touches && event.touches.length > 1) {
			return false;
		}
		if (startTimeStamp) {
			stopPlaying();
		} else {
			startPlaying();
		}
	}

	function handleUp(event) {
		event.preventDefault();
		if (250 < (Date.now() - startTimeStamp)) {
			stopPlaying();
		}
	}

	function startPlaying() {
		if (!startTimeStamp) {
			startTimeStamp = Date.now();
			playButton.classList.add('active');
			startBuffer(musicBuffer, true);
		}
	}

	function stopPlaying() {
		if (startTimeStamp) {
			startTimeStamp = null;
			playButton.classList.remove('active');
			stopCurrentSource();
			startBuffer(bellBuffer);
		}
	}

	function stopCurrentSource() {
		if (source) {
			source.stop();
			source = null;
		}
	}

	function startBuffer(bufferPromise, loop) {
		var requestId = ++sourceId;
		return bufferPromise.then(createAudioSource).then(function (audioSource) {
			if (requestId === sourceId) {
				audioSource.start(0);
				audioSource.loop = Boolean(loop);
				source = audioSource;
				return source;
			} else {
				throw new Error('Another sound was started before this one could load.');
			}
		});
	}

	function createAudioSource(buffer) {
		var bufferSource = audioCtx.createBufferSource();
		bufferSource.connect(audioCtx.destination);
		bufferSource.buffer = buffer;
		return bufferSource;
	}

	function loadAudio(url) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();

			xhr.onload = function() {
				audioCtx.decodeAudioData(xhr.response, function(decodedBuffer) {
					resolve(decodedBuffer);
				});
			};
			xhr.onerror = function(e) {
				reject(e.error);
			};

			xhr.open('GET', url);
			xhr.responseType = 'arraybuffer';
			xhr.send();
		});
	}
})();