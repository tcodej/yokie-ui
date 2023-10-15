const url = 'http://yokie.trentj.loc';

const getResult = async (endpoint, formData) => {
	let data = {
		method: 'GET'
	};

	if (formData) {
		data.method = 'POST';
		data.body = formData;
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

// POST requires a formdata object even if it isn't used
const formDataPost = () => {
	const formData = new FormData();
	formData.append('post', true);
	return formData;
}

export const getSearchResults = async (query) => {
	const formData = new FormData();
	formData.append('query', query);

	return getResult('/feed/search', formData);
};

export const getQueue = async () => {
	return getResult('/queue/get');
};

export const addQueue = async (data) => {
	const formData = new FormData();
	formData.append('type', 'add');

	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			formData.append(key, data[key]);
		}
	}

	return getResult('/queue/add', formData);
};

export const removeQueue = async (id) => {
	const formData = new FormData();
	formData.append('queue_id', id);

	return getResult('/queue/remove', formData);
};

export const getFeed = async (type) => {
	const formData = formDataPost();

	if (!type) {
		type = 'random';
	}

	return getResult(`/feed/${type}`, formData);
};

export const getSingers = async (detailed) => {
	const formData = formDataPost();

	if (detailed) {
		formData.append('detailed', true);
	}

	return getResult('/feed/singers', formData);
};

export const getSongTags = async (id) => {
	const formData = new FormData();
	formData.append('id', id);

	return getResult('/feed/song-tags', formData);
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

				var count = 0;
				result.items.forEach(function(item) {
					count++;
					var song = {
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
