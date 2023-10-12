export default function SideButtons() {

	const toggleSideButtons = () => {
		console.log('openPopup');
	}

	const openPopup = () => {
		console.log('openPopup');
	}

	const enterMessage = () => {
		console.log('enterMessage');
	}

	const showQueue = () => {
		console.log('showQueue');
	}

	const toggleSoundMenu = () => {
		console.log('toggleSoundMenu');
	}

	return (
		<div className="side-buttons">
			<button type="button" className="icon toggle" title="toggle side panels" onClick={toggleSideButtons}>toggle</button>
			<button type="button" className="icon popup" title="open the popup lyrics window" onClick={openPopup}>popup</button>
			<button type="button" className="icon message" title="type a message to show in the popup window" onClick={enterMessage}>message</button>
			<button type="button" className="icon show-queue" title="display the current queue in the popup window" onClick={showQueue}>show queue</button>
			<button type="button" className="icon sounds" title="play sound effects" onClick={toggleSoundMenu}>sounds</button>
			<div id="message-form"><input type="text" placeholder="type your message..." className="field" id="message-field" /> <button type="button" id="save-message">ok</button></div>
			<div id="sound-menu"></div>
		</div>
	)
}