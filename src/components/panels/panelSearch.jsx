import { Fragment, useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/application';
import * as api from '../../utils/api';
import { sort } from '../../utils';

let searchTimer = null;

export default function PanelSearch() {
	const { appState, updateAppState } = useAppContext();
	const [query, setQuery] = useState('');
	const [total, setTotal] = useState(0);
	const [searching, setSearching] = useState(false);
	// const [results, setResults] = useState([]);
	const [selectedSong, setSelectedSong] = useState({});
	const [sorted, setSorted] = useState(false);

	const updateQuery = (e) => {
		setSearching(true);
		setQuery(e.target.value);
	}

	// perform a search after query has updated
	useEffect(() => {
		if (query && query.length > 3) {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				search();
			}, 1000);
		}
	}, [query]);

	const search = async (e) => {
		if (e) {
			e.preventDefault();
		}

		api.getSearchResults(query).then((response) => {
			// setResults(response.result);
			setTotal(response.total);
			setSearching(false);
			updateAppState({
				songResults: response.result,
				message: response.message
			});
		});
	}

	const searchYouTube = async () => {
		api.getYouTubeResults(query +' karaoke').then((response) => {
			setTotal(response.total);
			updateAppState({
				songResults: response.result,
				message: response.message
			});
		});
	}

	const getFeed = (type) => {
		// set query to allow view to refresh
		//setQuery(type);

		api.getFeed(type).then((response) => {
			setTotal(response.total);
			updateAppState({
				songResults: response.result,
				message: response.message
			});
		});
	}

	const toggleSort = () => {
		if (!sorted) {
			// setResults(prevVals => sort([...prevVals], 'title'));
			setSorted(true);

		} else {
			// setResults(prevVals => sort([...prevVals], 'artist'));
			setSorted(false);
		}
	}

	const clearSearch = () => {
		setQuery('');
		// setResults([]);
		updateAppState({
			message: '',
			infoSong: false,
			infoTags: [],
			playerImg: false,
			songResults: []
		});
	}

	const selectSong = (item) => {
		setSelectedSong(item);
		updateAppState({ infoSong: item });

		const isYouTube = item.type === 'youtube';

		if (isYouTube) {
			updateAppState({ playerImg: item.thumbnail })
		}

		if (item) {
			api.getSongTags(item.id).then((response) => {
				updateAppState({ message: response.message });

				if (response.result) {
					updateAppState({ infoTags: response.result });
				}
			});
		}
	}

	const openQueueAdd = () => {
		updateAppState({ queueSong: selectedSong });
	}

	useEffect(() => {
		if (appState.prefs.totalSongs) {
			setTotal(appState.prefs.totalSongs);
		}
	}, [appState.prefs]);

	return (
		<div className="panel songs">
			<h2 className="tab hsl-light">Songs</h2>
			<div className="buttons hsl-light">
				<button type="button" className="random" onClick={() => getFeed('random')}>random</button>
				<button type="button" className="whatsnew" onClick={() => getFeed('newest')}>new</button>
				<button type="button" className="whatspopular" onClick={() => getFeed('popular')}>popular</button>
				{ (appState.songResults.length > 0) &&
					<Fragment>
						<button type="button" className="sort" onClick={toggleSort}>title sort</button>
						<button type="button" className="youtube" title={`Search YouTube for "${query} karaoke"`} onClick={searchYouTube}>youtube</button>
					</Fragment>
				}
				<div className="label">{total} songs.</div>
			</div>
			<div className="container hsl-light">
				<div className="search-results hsl-dark">

				{ searching && <div className="no-results">Searching for &quot;{query}&quot;...</div> }

				{ (appState.songResults.length > 0) &&
					<Fragment>
						<table className="results">
							<tbody>
							{
								appState.songResults.map((item) => {
									return (
										<tr
											key={item.id}
											onClick={() => { selectSong(item) }}
											onDoubleClick={openQueueAdd}
											className={selectedSong.id === item.id ? 'selected' : ''}
										>
											<td>{item.artist}</td>
											<td>
												<span dangerouslySetInnerHTML={{ __html: item.title }} />
												<button className="button add-queue" onClick={openQueueAdd}>add</button>
											</td>
										</tr>
									)
								})
							}
							</tbody>
						</table>
						{ appState.songResults[0].type !== 'youtube' &&
							<div className="no-results" onClick={searchYouTube}>Don't see what you want? Click to search YouTube.</div>
						}
					</Fragment>
				}

				{ (query && appState.songResults.length == 0 && !searching) &&
					<div className="no-results" onClick={searchYouTube}>No results for &quot;{query}&quot;. Click to search YouTube.</div>
				}

				</div>

				<form method="post" onSubmit={search} className="search-form">
					<input
						type="text"
						className="field search"
						name="query"
						value={query}
						placeholder="Search by song or artist..."
						autoComplete="off"
						onChange={updateQuery}
					/>
					{ query && 
						<a href="#" className="clear-field icon" title="clear the search results" onClick={clearSearch}>x</a>
					}
				</form>
			</div>
		</div>
	)
}