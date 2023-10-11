import { Fragment, useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../contexts/application';
import { CDGDecoder } from '../../utils/CDGDecoder';

export default function PanelPlayer() {
	const { appState, updateAppState } = useAppContext();
	const [songLoaded, setSongLoaded] = useState(false);
	const [playing, setPlaying] = useState(false);
	const [percent, setPercent] = useState(0);
	const audio = useRef();
	const canvas = useRef();

	let xhr = null;
	let cdgDecoder = null;
	let timeRemaining = 0;
	let lastPosition = 0;
	let timer = null;

	useEffect(() => {
		if (!songLoaded && appState.currentSong) {
			load();
		}
	}, [appState.currentSong]);

	const load = () => {
		console.log('loading', appState.currentSong);
		const song = appState.currentSong;
		const songID = song.id;
		// self.clearPlayer();
		// $('.loader').fadeIn('fast');

		// todo: come up with a better way to manage and cancel downlaods
		if (xhr !== null) {
			xhr.abort();
		}
		xhr = new XMLHttpRequest();
		updateAppState({ message: 'Loading video...' });
		xhr.open('GET', encodeURI(song.path) + '.cdg', true);
		xhr.responseType = 'arraybuffer';

		xhr.onload = function(e) {
			console.log(this.status);
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

					audio.current.addEventListener('loadeddata', audioReady, true);

					if (!cdgDecoder) {
						cdgDecoder = new CDGDecoder(canvas.current);
					}
					cdgDecoder.setCDGData(data); // send the CDG data to the decoder

					// now load audio
					updateAppState({ message: 'Loading audio...' });

					// $(audio).empty();

					// var sourceMP3 = document.createElement('source');
					// sourceMP3.type = "audio/mpeg";
					// sourceMP3.src = song.path + '.mp3';

					audio.current.src = song.path + '.mp3';

					// audio.appendChild(sourceMP3);
					// audio.load();

					// audio.controls = false;
					// audio.autoplay = false;
					// audio.muted = false;

					// if (song.pitch) {
					//     var request = new XMLHttpRequest();
					//     audioContext = new AudioContext();

					//     audioContext.onstatechange = function(data) {
					//         if (audioContext) {
					//             console.log(audioContext.state);
					//         }
					//     };

					//     audio.removeEventListener('loadeddata', self.audioReady, true);

					//     request.open('GET', song.path + '.mp3', true);
					//     request.responseType = 'arraybuffer';

					//     request.onload = function() {
					//         audio.muted = true;
					//         audioContext.decodeAudioData(request.response, function(buffer) {
					//             pitchShifter = new PitchShifter(audioContext, buffer, 1024);
					//             self.updatePitch(song.pitch);
					//             self.audioReady();
					//         });
					//     };

					//     request.send();

					// } else {
					//     // todo: will this properly destroy these?
					//     if (audioContext) {
					//         audioContext.close();
					//     }

					//     audioContext = null;
					//     pitchShifter = null;
					// }
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
		audio.current.addEventListener('timeupdate', audioUpdate, true);
		// audio.current.addEventListener('error', self.audioError, true);
		audio.current.addEventListener('play', play, true);
		// audio.current.addEventListener('pause', self.pause, true);
		// audio.current.addEventListener('ended', self.end, true);
		// audio.current.addEventListener('abort', self.stop, true);
		// audio.current.addEventListener('seeking', self.seeking, true);


		// $panel.find('.controls,.label').show();
		updateAppState({ message: 'Audio loaded' });
		// yokie.songPanel.updateSong({ id: songID, plays: true, duration: audio.duration });
		// $('.loader').fadeOut('fast');
		togglePlay();

		// this stops playback during an Admin song audit
		// if (typeof Admin !== 'undefined') {
		//     Admin.helper.success();
		// }
	}

	const audioUpdate = (e) => {
		let current = parseInt(audio.current.currentTime, 10);
		let total = parseInt(audio.current.duration, 10);
		setPercent(parseInt(current / total * 100, 10));

		if (isNaN(current) || isNaN(total)) return;

		timeRemaining = audio.current.duration - current;

		if (current !== lastPosition) {
			lastPosition = current;
			// $('.progress').css('width', percent+'%');

			// update the progress bar in the popup window
			// if (popup !== null) {
			// 	$(popup.document.getElementById('progress-bar')).css('width', percent+'%');
			// }
			
			// if (showTimeRemaining === true) {
			// 	$('.player-time').html('-'+ yokie.util.formatTime(timeRemaining) +'/'+ percent +'%');
			
			// } else {
			// 	$('.player-time').html(yokie.util.formatTime(current) +'/'+ yokie.util.formatTime(audio.duration));
			// }
			
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

	const togglePlay = () => {
		console.log('togglePlay', songLoaded, playing);

		if (playing === true) {
			// $('.playpause').removeClass('paused');

			// if (ytPlayer !== null) {
			//     ytPlayer.pauseVideo();
			//     if (popup !== null) {
			//         try {
			//             popupPlayer.pauseVideo();                                
			//         } catch(err) {
			//             // player not ready
			//         }
			//     }

			// } else {
			//     audio.pause();

			//     if (pitchShifter !== null) {
			//         pitchShifter.disconnect();
			//     }
			// }

			console.log('pause');
			audio.current.pause();

		} else {
			// $('.playpause').addClass('paused');

			// if (ytPlayer !== null) {
			//     ytPlayer.playVideo();
			//     if (popup !== null) {
			//         try {
			//             popupPlayer.playVideo();
			//         } catch(err) {
			//             // player isn't ready
			//         }
			//     }

			// } else {
			//     audio.play();

			//     if (pitchShifter !== null) {
			//         pitchShifter.connect(audioContext.destination);
			//     }
			// }

			console.log('play');
			audio.current.play();
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


	return (
		<div className="panel player">
			<h2 className="tab hsl-light">Player</h2>
			<div className="buttons hsl-light">
				{ songLoaded &&
					<Fragment>
						<div className="controls">
								<button type="button" className="icon playpause">play</button>
								<button type="button" className="icon fullscreen">fullscreen</button>
								<button type="button" className="icon clearplayer">x</button>

								<div className="progress-bar">
									<div className="loaded"></div>
									<div className="progress" style={{ width: percent }}>
										<div className="handle"></div>
									</div>
								</div>

						</div>
						<div className="label player-time">0:00/0:00</div>
					</Fragment>
				}
			</div>

			<div className="container hsl-light">
				<div className="loader"></div>
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