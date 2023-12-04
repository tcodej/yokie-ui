import { Fragment, useEffect, useState } from 'react';
import { getQueue, getSingers, getSingerLog, addQueue, removeQueue } from '../../utils/api';
import { getItem } from '../../utils';
import { useAppContext } from '../../contexts/application';

export default function PanelQueue() {
	const { appState, updateAppState } = useAppContext();
	const [queueData, setQueueData] = useState(false);
	const [singers, setSingers] = useState(false);
	const [showSingers, setShowSingers] = useState(false);
	const [singer, setSinger] = useState('');

	const refreshQueue = () => {
		getQueue().then((response) => {
			console.log(response);
			setQueueData(response);
		});
	}

	useEffect(() => {
		if (!queueData) {
			refreshQueue();
		}

		if (!singers) {
			// load singers for auto-complete
			getSingers().then((response) => {
				setSingers(response.result);
				updateAppState({ message: response.message });
			});
		}
	}, []);

	const formatArtist = (artist) => {
		return artist != '' ? artist +' / ' : '';
	}

	const play = (item) => {
		if (item) {
			updateAppState({ currentSong: item.song });
		}
	}

	const renderResults = () => {
		let ordinal = 0;

		return queueData.result.map((item) => {
			let className = 'queue-item';
			if (item.status < 2) {
				ordinal++;
			}

			if (item.status == 2) {
				className += ' complete';
			}

			return (
				<div key={item.id} className={className}>
					<div className="order queueplay" onClick={() => play(item)}>
						{ (item.status < 2) ? ordinal : '-' }
					</div>
					<div className="slider">
						<button className="little-button remove icon" onClick={() => { removeSinger(item.id) }}>x</button>
						<div className="little-button handle icon">↕</div>
					</div>
					<p className="singer">{item.name}</p>
					{ item.song &&
						<p className="song" title={`${item.song.title} (${item.time})`}>{formatArtist(item.song.artist)}{item.song.title}</p>
					}
					{ item.mobile && <div className="icon mobile" title="added from a mobile device"></div> }
					{ item.youtube && <div className="icon youtube" title="youtube video"></div> }

					{ !item.youtube &&
						<div className="pitch-controls">
							<button type="button" className="pitch down" onClick={() => updatePitch(item, 'down')}>-</button>
							<span className="pitch-val">{item.pitch ? item.pitch : '0'}</span>
							<button type="button" className="pitch up" onClick={() => updatePitch(item, 'up')}>+</button>
						</div>
					}
				</div>
			)
		})
	}

	const updatePitch = (item, direction) => {
		// todo: debounce, find item in results and update
		if (!item.pitch) {
			item.pitch = 0;
		}

		const dir = (direction === 'down') ? -1 : 1;
		let pitch = parseInt(item.pitch, 10);

		if (pitch+dir > 6 || pitch+dir < -6) {
			return;
		}

		item.pitch = pitch + dir;
		console.log('pitch', item.id, item.pitch);
	}

	const loadSingers = () => {
		getSingers(true).then((response) => {
			console.log(response);
			setQueueData([]);
			setSingers(response.result);
			setShowSingers(true);
		});
	}

	const loadSinger = (id) => {
		getSingerLog(id).then((response) => {
			console.log(response);
		});
	}

	const updateSinger = (e) => {
		setSinger(e.target.value);
	}

	const handleKeyUp = (e) => {
		if (e.key === 'Enter') {
			if (singer.trim()) {
				addToQueue();
			}
		}

		if (e.key === 'Escape') {
			closeAddQueue();
		}
	}

	const closeAddQueue = () => {
		setSinger('');
		updateAppState({ queueSong: false });
	}

	const addToQueue = () => {
		const data = {
			song_id: appState.queueSong.id,
			// singer_id: 1,
			name: singer.trim()
		}

		if (appState.queueSong.type === 'youtube') {
			data.youtube = true;
			data.song_id = 0;
			data.custom_path = appState.queueSong.path;
			data.custom_title = appState.queueSong.title;
		}

		addQueue(data).then((response) => {
			closeAddQueue();
			updateAppState({ message: response.message });
			refreshQueue();
		});
	}

	const removeSinger = (id) => {
		removeQueue(id).then((response) => {
			updateAppState({ message: response.message });
			refreshQueue();
		});
	}

	return (
		<div className="panel queue">
			<h2 className="tab hsl-light">Queue</h2>
			<div className="buttons hsl-light">
				<button type="button" className="singers" title="show the list of singers" onClick={loadSingers}>singers</button>
				<div className="queue-buttons">
					<button type="button" className="clean" title="clean the queue of only completed songs">clean</button>
					<button type="button" className="empty" title="empty the entire queue">empty</button>
				</div>
				<div className="label"></div>
			</div>
			<div className="container hsl-light">
				<div className={'queue-add'+ (appState.queueSong ? ' is-active' : '')}>
				{ appState.queueSong &&
					<Fragment>
						<div className="order">{queueData.nextOrdinal}</div>
						<div className="add-container">
							<h3>Who is going to sing this song?</h3>
								<form method="post" className="queue-form">
									<input type="text" className="field queue-auto" maxLength="26" defaultValue="" autoComplete="off" disabled />
									<input type="text" className="field queue" maxLength="26" value={singer} onChange={updateSinger} autoComplete="off" autoFocus onKeyUp={handleKeyUp} />
									<a href="#" className="clear-field icon" onClick={closeAddQueue}>x</a>
								</form>
							<p className="song">{appState.queueSong.artist} / {appState.queueSong.title}</p>
						</div>
					</Fragment>
				}
				</div>
				<div className={'queue-list hsl-dark'+ (appState.queueSong ? ' slide-down' : '')}>
					{ (queueData.result && queueData.result.length > 0) && renderResults() }
					{ (showSingers > 0) &&
						singers.map((item) => {
							return (
								<div key={item.id} className="singer-item queue-item" onClick={() => loadSinger(item.id)}>
									<div className="order">&lt;-</div>
									<p className="singer">{item.name}</p>
									<p className="song">{item.songs} songs / {item.performances} performances</p>
								</div>
							)
						})
					}
				</div>
			</div>
		</div>
	)
}