import { Fragment } from 'react';
import { useAppContext } from '../../contexts/application';

export default function PanelInfo() {
	const { appState } = useAppContext();

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
				<div className="song-details"></div>
			</div>
		</div>
	)
}