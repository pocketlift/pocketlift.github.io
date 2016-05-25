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
(function (audioCtx, documentElement) {

	'use strict';

	var bossa = new ButtonController('bossa', 'bossa.mp3', 'bell.mp3');
	var monkey = new ButtonController('monkey', 'monkey.mp3', null);

	function ButtonController(elementId, playFile, stopfile) {
		var source;
		var sourceId = 0;
		var playButton = document.getElementById(elementId);
		var playBuffer = playFile && loadAudio(playFile);
		var stopBuffer = stopfile && loadAudio(stopfile);
		var startTimeStamp;

		playButton.disabled = true;
		Promise.all([ playBuffer, stopBuffer ]).then(function () {
			playButton.disabled = false;
		});

		playButton.addEventListener('mousedown', handleDown);
		playButton.addEventListener('touchstart', handleDown);

		this.play = startPlaying;
		this.stop = stopPlaying;

		return;

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
				startBuffer(playBuffer, true);

				documentElement.addEventListener('mouseup', handleUp);
				documentElement.addEventListener('touchend', handleUp);
			}
		}

		function stopPlaying() {
			if (startTimeStamp) {
				startTimeStamp = null;
				playButton.classList.remove('active');
				stopCurrentSource();
				startBuffer(stopBuffer);

				documentElement.removeEventListener('mouseup', handleUp);
				documentElement.removeEventListener('touchend', handleUp);
			}
		}

		function stopCurrentSource() {
			if (source) {
				source.stop();
				source = null;
			}
		}

		function startBuffer(bufferPromise, loop) {
			if (!bufferPromise) {
				return;
			}

			var requestId = ++sourceId;
			bufferPromise.then(createAudioSource).then(function (audioSource) {
				if (requestId === sourceId) {
					audioSource.start(0);
					audioSource.loop = Boolean(loop);
					source = audioSource;
				}
			});
		}
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
				if (xhr.status == 200) {
					audioCtx.decodeAudioData(xhr.response, function(decodedBuffer) {
						resolve(decodedBuffer);
					});
				} else {
					reject(xhr.statusText);
				}
			};
			xhr.onerror = function(e) {
				reject(e.error);
			};

			xhr.open('GET', url);
			xhr.responseType = 'arraybuffer';
			xhr.send();
		});
	}

})(
	new (window.AudioContext || window.webkitAudioContext)(),
	document.documentElement
);
