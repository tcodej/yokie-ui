const url = 'http://yokie.trentj.loc';

// POST requires a formdata object even if it isn't used
const formDataPost = () => {
	const formData = new FormData();
	formData.append('post', true);
	return formData;
}

export const getSearchResults = async (query) => {
	const formData = new FormData();
	formData.append('query', query);

	const response = await fetch(`${url}/feed/search`, {
		method: 'POST',
		body: formData
	});

	const result = await response.json();
	return result;
};

export const getQueue = async () => {
	const response = await fetch(`${url}/queue/get`);
	const result = await response.json();
	return result;
};

export const addQueue = async (data) => {
	const formData = new FormData();
	formData.append('type', 'add');

	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			formData.append(key, data[key]);
		}
	}

	const response = await fetch(`${url}/queue/add`, {
		method: 'POST',
		body: formData
	});

	const result = await response.json();
	return result;
};

export const removeQueue = async (id) => {
	const formData = new FormData();
	formData.append('queue_id', id);

	const response = await fetch(`${url}/queue/remove`, {
		method: 'POST',
		body: formData
	});

	const result = await response.json();
	return result;
};

export const getFeed = async (type) => {
	if (!type) {
		type = 'random';
	}

	const response = await fetch(`${url}/feed/${type}`, {
		method: 'POST',
		body: formDataPost()
	});

	const result = await response.json();
	return result;
};

export const getSingers = async (detailed) => {
	const formData = formDataPost();

	if (detailed) {
		formData.append('detailed', true);
	}

	const response = await fetch(`${url}/feed/singers`, {
		method: 'POST',
		body: formData
	});

	const result = await response.json();
	return result;
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
