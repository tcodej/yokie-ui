import { Fragment } from 'react';
import { useAppContext } from '../../contexts/application';
import { formatTime } from '../../utils';

export default function PanelInfo() {
	const { appState } = useAppContext();

	const tagSearch = (tag_id) => {
		console.log('search for tag', tag_id);
	}

	return (
		<div className="panel info">
			<h2 className="tab hsl-light">Info</h2>
			<div className="buttons hsl-light">
				<button type="button" className="context queue" title="add the selected track to the queue">queue</button>
				{ appState.isAdmin &&
					<Fragment>
						<button type="button" className="context play" title="play the selected song now">play</button>
						<button type="button" className="context edit" title="edit the selected song">edit</button>
						<button type="button" className="context delete" title="delete the selected song">delete</button>
					</Fragment>
				}
				<button type="button" className="tags" title="browse songs by tag">tags</button>
				<button type="button" className="admin notes" title="list all songs with notes">notes</button>
				<button type="button" className="admin dupes" title="search the entire song list for duplicates">dupes</button>
				<button type="button" className="admin test" title="test that files for the songs in the current list are available">test</button>
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
								<li key={item.tag_id} onClick={() => { tagSearch(item.tag_id) }}>
									{item.tag_name}
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