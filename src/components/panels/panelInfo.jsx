import { Fragment } from 'react';
import { useAppContext } from '../../contexts/application';
import * as api from '../../utils/api'
import { formatTime } from '../../utils';

export default function PanelInfo() {
	const { appState, updateAppState } = useAppContext();

	const tagSearch = (tag_id) => {
		api.getSearchTag(tag_id).then((response) => {
			updateAppState({
				songResults: response.result,
				message: response.message
			});
		});
	}

	const getAllTags = () => {
		api.getFeed('tags').then((response) => {
			updateAppState({
				infoTags: response.result,
				message: response.message
			});
		});
	}

	const getNotes = () => {
		api.getFeed('notes').then((response) => {
			updateAppState({
				songResults: response.result,
				message: response.message
			});
		});
	}

	const adminQueue = () => {
		console.log('add to queue');
	}

	const adminPlay = () => {
		console.log('play without queue');
	}

	const adminEdit = () => {
		console.log('edit song table');
	}

	const adminDelete = () => {
		console.log('delete track from db');
	}

	const adminDupes = () => {
		console.log('check for dupes');
	}

	const adminTest = () => {
		console.log('test listed songs');
	}

	return (
		<div className="panel info">
			<h2 className="tab hsl-light">Info</h2>
			<div className="buttons hsl-light">
				{ appState.isAdmin &&
					<Fragment>
					{ appState.infoSong &&
						<Fragment>
							<button type="button" onClick={adminQueue} className="context queue" title="add the selected track to the queue">queue</button>
							<button type="button" onClick={adminPlay} className="context play" title="play the selected song now">play</button>
							<button type="button" onClick={adminEdit} className="context edit" title="edit the selected song">edit</button>
							<button type="button" onClick={adminDelete} className="context delete" title="delete the selected song">delete</button>
						</Fragment>
					}
						<button type="button" onClick={getNotes} className="admin notes" title="list all songs with notes">notes</button>
						<button type="button" onClick={adminDupes} className="admin dupes" title="search the entire song list for duplicates">dupes</button>
						<button type="button" onClick={adminTest} className="admin test" title="test that files for the songs in the current list are available">test</button>
					</Fragment>
				}
				<button type="button" onClick={getAllTags} className="tags" title="browse songs by tag">tags</button>
				<div className="label">{appState.message}</div>
			</div>
			<div className="container hsl-light">
				<div className="song-details">
				{appState.infoSong &&
					<p>
						{appState.infoSong.note && <div className="note">{appState.infoSong.note}</div>}
						{appState.infoSong.song_id} ({appState.infoSong.id})<br />
						{(appState.infoSong.plays == 0) ? (
							<span>Never been played.</span>
						) : (
							<span>Played {appState.infoSong.plays} time{(appState.infoSong.plays > 1) ? 's' : ''}.</span>
						)}
						&nbsp;Time: {formatTime(appState.infoSong.duration)}<br />
						{appState.infoSong.date_added && <span>Added on {appState.infoSong.date_added}.</span>}
						&nbsp;Status: {appState.infoSong.audit === true ? 'Verified' : 'Unverified'}.
					</p>
				}

				{(appState.infoTags.length > 1) &&
					<ul className="tags-list">
						{ appState.infoTags.map((item) => {
							return (
								<li key={item.id} onClick={() => { tagSearch(item.id) }}>
									{item.name}
								</li>
							)
						})}
					</ul>
				}
				</div>
			</div>
		</div>
	)
}