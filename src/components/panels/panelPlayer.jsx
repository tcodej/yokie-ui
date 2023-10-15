import { Fragment, useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../contexts/application';
import { CDGDecoder } from '../../utils/CDGDecoder';
import { formatTime } from '../../utils';
import { PitchShifter } from '../../utils/soundtouch';

export default function PanelPlayer() {
	const { appState, updateAppState } = useAppContext();
	const [loading, setLoading] = useState(false);
	const [songLoaded, setSongLoaded] = useState(false);
	const [playing, setPlaying] = useState(false);
	const [time, setTime] = useState('');
	const [percent, setPercent] = useState(0);
	const [showTimeRemaining, setShowTimeRemaining] = useState(false);
	const [lastPosition, setLastPosition] = useState(0);
	const [cdgDecoder, setCdgDecoder] = useState();
	const [listenersAdded, setListenersAdded] = useState(false);
	const audio = useRef();
	const canvas = useRef();
	const count = useRef(0);

	let audioContext = null;
	let timer = null;
	let popupTimer = null;
	let popup = null;
	let ytPlayer = null;
	let pitchShifter = null;

	useEffect(() => {
		console.log('useEffect');

		if (canvas.current) {
			setCdgDecoder(new CDGDecoder(canvas.current));
		}
	}, [canvas]);

	useEffect(() => {
		if (appState.currentSong) {
			load();
		}
	}, [appState.currentSong]);

	const load = () => {
		console.log('loading', appState.currentSong);
		const song = appState.currentSong;
		const songID = song.id;
		clearPlayer();
		setLoading(true);

		// todo: come up with a better way to manage and cancel downlaods
		// if (xhr !== null) {
		// 	xhr.abort();
		// }
		const xhr = new XMLHttpRequest();
		updateAppState({ message: 'Loading video...' });
		xhr.open('GET', encodeURI(song.path) + '.cdg', true);
		xhr.responseType = 'arraybuffer';

		xhr.onload = function(e) {
			switch (this.status) {
				case 200:
					let data = [],
						arrayBuffer = xhr.response;

					if (arrayBuffer) {
						const byteArray = new Uint8Array(arrayBuffer);
						for (let i = 0; i < byteArray.byteLength; i++) {
							data[i] = byteArray[i];
						}
					}

					audio.current.addEventListener('loadeddata', audioReady);
					cdgDecoder.setCDGData(data); // send the CDG data to the decoder

					// now load audio
					updateAppState({ message: 'Loading audio...' });

					// $(audio).empty();

					audio.current.src = song.path + '.mp3';
					audio.current.volume = 0.05;

					if (song.pitch) {
						let request = new XMLHttpRequest();
						const AudioContext = window.AudioContext || window.webkitAudioContext;

						audioContext = new AudioContext();

						audioContext.onstatechange = function(data) {
							if (audioContext) {
								console.log(audioContext.state);
							}
						};

						audio.current.removeEventListener('loadeddata', audioReady, true);

						request.open('GET', song.path + '.mp3', true);
						request.responseType = 'arraybuffer';

						request.onload = function() {
							audio.current.muted = true;
							audioContext.decodeAudioData(request.response, function(buffer) {
								pitchShifter = new PitchShifter(audioContext, buffer, 1024);
								updatePitch(song.pitch);
								audioReady();
							});
						};

						request.send();

					} else {
						// todo: will this properly destroy these?
						if (audioContext) {
							audioContext.close();
						}

						audioContext = null;
						pitchShifter = null;
					}
					break;

				case 500:
				case 403:
				case 404:
					// self.videoError();
					break;

				default:
					console.log('Load status '+ this.status);
					updateAppState({ message: 'Load status '+ this.status });
					break;
			}
		};

		xhr.send();
	}

	const audioReady = () => {
		setSongLoaded(true);

		updateAppState({ message: 'Audio loaded' });

		addListeners();
		// yokie.songPanel.updateSong({ id: songID, plays: true, duration: audio.duration });

		setLoading(false);
		togglePlay();
		console.log(count.current);

		// this stops playback during an Admin song audit
		// if (typeof Admin !== 'undefined') {
		//     Admin.helper.success();
		// }
	}

	const addListeners = () => {
		console.log('addListeners');
		audio.current.addEventListener('timeupdate', audioUpdate, true);
		audio.current.addEventListener('error', audioError, true);
		audio.current.addEventListener('play', play, true);
		audio.current.addEventListener('pause', pause, true);
		audio.current.addEventListener('ended', end, true);
		audio.current.addEventListener('abort', stop, true);
		audio.current.addEventListener('seeking', seeking, true);
	}

	const removeListeners = () => {
		console.log('removeListeners');
		audio.current.removeEventListener('loadeddata', audioReady, true);
		audio.current.removeEventListener('timeupdate', audioUpdate, true);
		audio.current.removeEventListener('error', audioError, true);
		audio.current.removeEventListener('play', play, true);
		audio.current.removeEventListener('pause', pause, true);
		audio.current.removeEventListener('ended', end, true);
		audio.current.removeEventListener('abort', stop, true);
		audio.current.removeEventListener('seeking', seeking, true);
	}

	const audioUpdate = (e) => {
		let current = parseInt(audio.current.currentTime, 10);
		let total = parseInt(audio.current.duration, 10);
		let percent = parseInt(current / total * 100, 10);
		let timeRemaining = 0;

		if (isNaN(percent)) {
			percent = 0;
		}

		setPercent(percent);

		if (isNaN(current) || isNaN(total)) return;

		timeRemaining = audio.current.duration - current;

		if (current !== lastPosition) {
			setLastPosition(current);
			setPercent(percent);

			// update the progress bar in the popup window
			// if (popup !== null) {
			// 	$(popup.document.getElementById('progress-bar')).css('width', percent+'%');
			// }

			if (showTimeRemaining === true) {
				setTime('-'+ formatTime(timeRemaining) +'/'+ percent +'%');
			
			} else {
				setTime(formatTime(current) +'/'+ formatTime(audio.current.duration));
			}
			
			// // todo: remote should have its own timer, and this should
			// // publish less frequently only to keep remote in sync
			// yokie.realtime.publish({
			// 	type: 'time-update',
			// 	current: current,
			// 	total: total,
			// 	percent: percent
			// });
		}
	}

	const audioError = (e) => {
		console.log(e);
		updateAppState({ message: 'Audio error' });
		//yokie.debug.log('Audio error', e);
		// todo: remove
		// if (typeof Admin !== 'undefined') {
		//     Admin.helper.reportError('audio');
		// }
	}

	const togglePlay = () => {
		count.current = count.current + 1;
		if (playing === true) {
			if (ytPlayer !== null) {
				ytPlayer.pauseVideo();

				if (popup !== null) {
					try {
						popupPlayer.pauseVideo();  

					} catch(err) {
						// player not ready
					}
				}

			} else {
				audio.current.pause();

				if (pitchShifter !== null) {
					pitchShifter.disconnect();
				}
			}

		} else {
			if (ytPlayer !== null) {
				ytPlayer.playVideo();

				if (popup !== null) {
					try {
						popupPlayer.playVideo();

					} catch(err) {
						// player isn't ready
					}
				}

			} else {
				audio.current.play();

				if (pitchShifter !== null) {
					pitchShifter.connect(audioContext.destination);
				}
			}
		}

		setPlaying(!playing);
	}

	const play = () => {
		setPlaying(true);

		if (timer === null) {
			timer = setInterval(update, 20);
		}

		// self.startPopupTimer();

		// yokie.realtime.publish('player-play');
		// self.toggleSideButtons(false);
		// self.clearMessage();
	}

	const pause = (e) => {
		stop();
		clearTimers();
		updateAppState({ message: 'player-stop' });

		if (pitchShifter !== null) {
			pitchShifter.disconnect();
		}
	}

	const stop = (e) => {
		if (playing === true) {
			audio.current.pause();

			// if (ytPlayer !== null) {
			//     ytPlayer.pauseVideo();
			// }

			setPlaying(false);
			
			clearTimers();
			// yokie.realtime.publish('player-stop');
			// self.toggleSideButtons(true);
		}
	}

	const end = (e) => {
		stop();
		clearPlayer();
		// self.updatePopup();
		// yokie.queuePanel.songEnded();
		// yokie.realtime.publish('player-clear');
	}

	const seeking = (e) => {
		// force a screen update only when paused
		if (playing === false) {
			update();
		}
	}

	const seekTo = (option) => {
		console.log('seekTo', option);
		// seeking is not possible with pitch shifted songs
		if (songLoaded === false || pitchShifter !== null) return;

		if (typeof option === 'string') {
			var seconds = 10;

			if (option === 'forward') {
				audio.current.currentTime += seconds;

			} else {
				audio.current.currentTime -= seconds;
			}

		} else {
			// seek to the provided value
			// if (ytPlayer !== null) {
			//     ytPlayer.seekTo(parseInt(option, 10));

			// } else {
				audio.current.currentTime = parseInt(option, 10);
			// }
		}
	}

	const clearTimers = () => {
		clearInterval(timer);
		clearInterval(popupTimer);
		timer = null;
		popupTimer = null;
		// also clear any pending chat bubbles
		// self.popupClearChat();
	}


	const update = () => {
		// if (ytPlayer !== null) {
		//     self.youTubeUpdate();
		//     return;
		// }

		let position = Math.floor(audio.current.currentTime * 300);
		let pack = cdgDecoder.getCurrentPack();

		position = (position < 0) ? 0 : position;

		if (position < (pack - 300)) {
			cdgDecoder.reset();
			pack = 0;
		}

		if (position > pack) {
			cdgDecoder.decode(position);
			// self.updatePopup();
		}
	}

	// toggles player canvas/youtube fullsceen in browser
	const toggleFullScreen = (forceClose) => {
		// if ($('.panel.player').hasClass('is-fullscreen') || forceClose === true) {
		//     $('.panel.player').removeClass('is-fullscreen');
		//     $panel.find('.fullscreen').removeClass('is-active');
		//     $(window).off('keyup');

		// } else {
		//     $('.panel.player').addClass('is-fullscreen');
		//     $panel.find('.fullscreen').addClass('is-active');

		//     $(window).on('keyup', function(e) {
		//         switch (e.keyCode) {
		//             // esc
		//             case 27:
		//                 self.toggleFullScreen()
		//             break;
		//         }
		//     });
		// }
	}

	const clearPlayer = (e) => {
		if (e !== undefined) {
			e.preventDefault();
		}

		updateAppState({ currentSong: false });
		setSongLoaded(false);
		stop();
		cdgDecoder.reset();
		removeListeners();
		// self.updatePopup();
		// self.clearMessage();
		// yokie.realtime.publish('player-clear');
		// self.toggleSideButtons(true);
		clearImage();

		// update the progress bar in the popup window
		// if (popup !== null) {
		//     $(popup.document.getElementById('progress-bar')).css('width', '0');
		// }

		// self.youTubePlayerClear();
		// self.toggleFullScreen(true);
	}

	const toggleTime = () => {
		console.log('toggleTime');
		setShowTimeRemaining(true);
		audioUpdate();
	}

	// used to show a YouTube thumbnail in the player window
	const showImage = (url) => {
		// $panel.find('.message-wrapper')
		//     .html('<img src="'+ url +'">')
		//     .show()
		//     .on('click', self.clearImage);
	}

	const clearImage = (url) => {
		// $panel.find('.message-wrapper')
		//     .empty()
		//     .hide()
		//     .off('click');
	}

	const toggleView = (toggleQueue) => {
		if (toggleQueue === undefined) {
			toggleQueue = false;
		}

		if (collapsed === true) {
			collapsed = false;
			// $panel.removeClass('collapsed');

			if (toggleQueue === true) {
				// yokie.queuePanel.toggleView();
			}

		} else {
			collapsed = true;
			// $panel.addClass('collapsed');

			if (toggleQueue === true) {
				// yokie.queuePanel.toggleView();
			}
		}
	}

	const progressClick = (e) => {
		console.log(e);
		const duration = ytPlayer !== null ? ytPlayer.getDuration() : audio.current.duration;
		const total = parseInt(duration, 10);
		const percent = e.nativeEvent.offsetX / e.target.offsetWidth;
		console.log(e.nativeEvent.offsetX, e.target.offsetWidth);
		seekTo(Math.floor(total * percent));
	}

	const updatePitch = (pitch) => {
		let newPitch = 0;
		pitch = parseInt(pitch, 10);

		var pitchMap = [
				0.049,  // -6
				0.05,   // -5
				0.052,  // -4
				0.053,  // -3
				0.054,  // -2
				0.058,  // -1
				0,      // 0
				0.06,   // 1
				0.061,  // 2
				0.063,  // 3
				0.065,  // 4
				0.067,  // 5
				0.068   // 6
			],
			index = pitch + 6;

		if (typeof pitch == 'number') {
			if (pitch < -6) pitch = -6;
			if (pitch > 6) pitch = 6;

			newPitch = parseFloat(((pitch * pitchMap[index]) + 1).toFixed(3));

		} else {
			return;
		}
		
		if (pitchShifter) {
			pitchShifter.pitch = newPitch;
		}
	}

	return (
		<div className="panel player">
			<h2 className="tab hsl-light" onDoubleClick={toggleView}>Player</h2>
			<div className="buttons hsl-light">
				{ songLoaded &&
					<Fragment>
						<div className="controls">
							<button type="button" className={'icon playpause'+ (playing ? ' playing' : '')} onClick={togglePlay}>play</button>
							<button type="button" className="icon fullscreen" onClick={toggleFullScreen}>fullscreen</button>
							<button type="button" className="icon clearplayer" onClick={clearPlayer}>x</button>

							<div className="progress-bar" onClick={progressClick}>
								<div className="loaded"></div>
								<div className="progress" style={{ width: percent }}>
									<div className="handle"></div>
								</div>
							</div>
						</div>
						<div className="label player-time" onClick={toggleTime}>{time}</div>
					</Fragment>
				}
			</div>

			<div className="container hsl-light">
			{ loading &&
				<div className="loader"></div>
			}
				<div className="message-wrapper"></div>

				<div id="player">
					<audio className="player-audio" ref={audio} />
					<div className="player-wrapper hsl-dark">
						<canvas className="player-canvas" width="300" height="216" ref={canvas}></canvas>
					</div>
				</div>

			</div>
		</div>
	)
}