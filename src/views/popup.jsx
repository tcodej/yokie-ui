import { useState, useEffect } from 'react';

export default function Popup({ ref }) {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			setIsOpen(true);

			if (typeof window !== 'undefined') {
				window.opener.console.log(window.opener);
				//window.opener.yokie.playerPanel.popupOpened();
/*
				.on('unload', window.opener.yokie.playerPanel.popupClosed)
				.on('keyup', function(e) {
					switch (e.keyCode) {
						// key F
						case 70:
							window.opener.yokie.playerPanel.popupFullScreen();
						break;
					}
				});
*/
			}
		}
	}, [isOpen]);

	return (
		<div id="popup-wrapper">
			<div id="popup-chat"></div>
			<div className="message-wrapper" id="message-wrapper"></div>
			<div id="progress-container">
				<div id="progress-bar"></div>
			</div>
			<img id="popup-img" src="img/pixel.gif" alt="Popup Image" />
			<canvas id="popup-canvas" width="300" height="216"></canvas>
			<div id="yt-player"></div>
		</div>
	);
}
