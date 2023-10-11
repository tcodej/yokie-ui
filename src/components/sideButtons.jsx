export default function SideButtons() {
	return (
		<div className="side-buttons">
			<button type="button" className="icon toggle" title="toggle side panels">toggle</button>
			<button type="button" className="icon popup" title="open the popup lyrics window">popup</button>
			<button type="button" className="icon message" title="type a message to show in the popup window">message</button>
			<button type="button" className="icon show-queue" title="display the current queue in the popup window">show queue</button>
			<button type="button" className="icon sounds" title="play sound effects">sounds</button>
			<div id="message-form"><input type="text" placeholder="type your message..." className="field" id="message-field" /> <button type="button" id="save-message">ok</button></div>
			<div id="sound-menu"></div>
		</div>
	)
}