import { useState } from 'react';

export default function Home() {
	const [query, setQuery] = useState('');

	const updateQuery = (e) => {
		setQuery(e.target.value);
	}

	return (
		<div id="mobile-wrapper" className="no-select">
			<header>
				<h1>yokie</h1>
				<div id="btn-menu">
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>

				<nav>
					<div className="links">
						<a href="#" className="whatsnew">New Songs</a>
						<a href="#" className="popular">Popular Songs</a>
						<a href="#" className="random">Random Songs</a>
						<a href="/booklet" className="booklet" target="_blank">Song Booklet</a>
						<a href="#" className="chat">Send Message</a>
					</div>
				</nav>
			</header>
			<div className="tab search hsl-light">
				<form method="post" action="/feed/search" className="search-form">
					<input
						type="text"
						className="field search"
						value={query}
						maxLength="60"
						placeholder="Type here to search"
						onChange={updateQuery}
					/>
					<a href="#" className="clear-field icon">x</a>
				</form>
				<div className="search-results"></div>
			</div>

			<div className="tab queue hsl-light">
				<div className="queue-top"></div>
				<div className="queue-list"></div>
			</div>

			<div className="form-add"></div>

			<div className="bottom">
				<button type="button" className="search selected">search</button>
				<button type="button" className="queue">queue</button>
			</div>
		</div>
	);
}
