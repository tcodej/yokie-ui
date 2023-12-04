// const url = 'http://yokie.trentj.loc';
// const url = 'https://yokie.org';
const url = 'http://localhost:3000/api/yokie';

const getResult = async (endpoint, postData) => {
	let data = {
		method: 'GET'
	};

	// if (postData) {
	// 	let formData = new FormData();
	// 	data.method = 'POST';

	// 	for (const [key, value] of Object.entries(postData)) {
	// 		formData.append(key, value);
	// 	}

	// 	data.body = formData;
	// }

	if (postData) {
		data = {
			method: 'POST',
        	headers: {
	            'Content-Type': 'application/json'
        	},
        	body: JSON.stringify(postData)
        };
	}

	try {
		const response = await fetch(`${url}${endpoint}`, data);
		const result = await response.json();
		result.ok = response.ok;
		// console.log(result);
		return result;

	} catch(err) {
		return {
			ok: false,
			message: 'API call failed.',
			result: []
		}
	}
}

export const getPreferences = async () => {
	return getResult('/feed/preferences');
};

export const getSearchResults = async (query) => {
	return getResult('/search', { query: query });
};

export const getQueue = async () => {
	return getResult('/queue/get');
};

export const addQueue = async (data) => {
	return getResult('/queue/add', { type: 'add', ...data });
};

export const removeQueue = async (id) => {
	return getResult('/queue/remove', { queue_id: id });
};

export const getFeed = async (type) => {
	if (!type) {
		type = 'random';
	}

	return getResult(`/feed/${type}`, { post: true });
};

export const getSingers = async (detailed) => {
	let data = {
		post: true
	}

	if (detailed) {
		data.detailed = true;
	}

	return getResult('/feed/singers', data);
};

export const getSingerLog = async (id) => {
	return getResult('/feed/singer-log', { id: id });
}

export const getSongTags = async (id) => {
	return getResult('/feed/song-tags', { id: id });
};

export const getSearchTag = async (id) => {
	return getResult('/feed/search-tag', { id: id });
};



export const getYouTubeResults = async (query) => {
	const params = new URLSearchParams({
		maxResults: 10,
		order: 'relevance',
		type: 'video',
		part: 'snippet',
		q: query,
		key: import.meta.env.VITE_YOUTUBE_KEY
	});

	const response = await fetch('https://youtube.googleapis.com/youtube/v3/search?'+ params);
	const result = await response.json();

	let searchData = {
		message: '',
		result: [],
		total: 0
	};

	if (result) {
		try {
			if (result.items) {
				searchData.total = result.items.length;
				searchData.message = 'YouTube search complete.'

				let count = 0;
				result.items.forEach(function(item) {
					count++;
					const song = {
						type: 'youtube',
						thumbnail: item.snippet.thumbnails.high.url,
						// artist: item.snippet.channelTitle,
						artist: 'YouTube',
						audit: '0',
						date_added: item.snippet.publishedAt,
						duration: '',
						id: 'youtube-'+ count,
						note: '',
						path: item.id.videoId,
						plays: '0',
						song_id: 'youtube',
						title: item.snippet.title
					};

					searchData.result.push(song);
				});
			}

		} catch(err) {
			searchData.message = 'YouTube returned no results.';
		}

	} else {
		searchData.message = 'YouTube error.';
	}

	return searchData;
};
