import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/application';
import { updateInterfaceColors } from '../../utils';

export default function PanelPreferences() {
	const { appState } = useAppContext();
	const [saveDisabled, setSaveDisabled] = useState(true);
	const [prefs, setPrefs] = useState(appState.prefs);
	const [newSinger, setNewSinger] = useState('');
	const remoteAddEnabled = prefs.remoteAddEnabled ? 'checked' : false;
	const chatEnabled = prefs.chatEnabled ? 'checked' : false;

	const updateSlider = (e) => {
		updatePrefs({ [e.target.id]: e.target.value });
	}

	const updateCheckbox = (e) => {
		updatePrefs({ [e.target.id]: e.target.checked });
	}

	const updateTextfield = (e) => {
		updatePrefs({ [e.target.id]: e.target.value });
		setSaveDisabled(false);
	}

	const updateNewSinger = (e) => {
		setNewSinger(e.target.value);
	}

	const updatePrefs = (newVals) => {
		setSaveDisabled(false);
		setPrefs(prevVals => {
			return {
				...prevVals,
				...newVals
			};
		});
	}

	// todo: send data to the api
	const saveNewSinger = () => {
		console.log('saving singer', newSinger);
	}

	const savePrefs = () => {
		console.log('saving prefs', prefs);    	
	}

	const cancelPrefs = () => {
		console.log('cancel prefs');
		updatePrefs({ ...appState.prefs });
	}

	useEffect(() => {
		updateInterfaceColors(
			prefs.hue,
			prefs.saturation,
			prefs.lightness
		);
	}, [prefs.hue, prefs.saturation, prefs.lightness]);

	return (
		<div className="panel preferences">
			<h2 className="tab hsl-light">Prefs.</h2>
			<div className="buttons hsl-light">
				<button type="button" className="save" disabled={saveDisabled} title="save your changes" onClick={savePrefs}>save</button>
				<button type="button" className="cancel" title="cancel your changes" onClick={cancelPrefs}>cancel</button>
			</div>
			<div className="container hsl-light">
				<div className="inner-container hsl-dark">
					<form id="form-preferences">
						<div className="row remote-add">
							<label htmlFor="remoteAddEnabled">Allow remote signups?</label>
							<input
								type="checkbox"
								id="remoteAddEnabled"
								className="field"
								value="true"
								checked={remoteAddEnabled}
								onChange={updateCheckbox}
							/>
						</div>

						<div className="row remote-add">
							<label htmlFor="remoteAddEnabled">Allow chat bubbles?</label>
							<input
								type="checkbox"
								id="chatEnabled"
								className="field"
								value="true"
								checked={chatEnabled}
								onChange={updateCheckbox}
							/>
						</div>

						<div className="row">
							<label htmlFor="whatsNewDate">&quot;What&apos;s New&quot; date</label>
							<input
								type="text"
								placeholder="YYYY-MM-DD"
								value={prefs.whatsNewDate}
								className="field whatsNewDate"
								id="whatsNewDate"
								onChange={updateTextfield}
							/>
						</div>

						<div className="row">
							<label htmlFor="newSinger">Add a new singer</label>
							<input
								type="text"
								placeholder="Name"
								value={newSinger}
								className="field newSinger"
								id="newSinger"
								onChange={updateNewSinger}
							/>
							<button type="button" className="add" onClick={saveNewSinger}>add</button>
						</div>

						<div className="row">
							<label htmlFor="hue">Hue</label>
							<input
								type="range"
								min="0"
								max="255"
								value={prefs.hue}
								className="field hue"
								id="hue"
								onChange={updateSlider}
							/>
							<br />

							<label htmlFor="saturation">Saturation</label>
							<input
								type="range"
								min="0"
								max="100"
								value={prefs.saturation}
								className="field saturation"
								id="saturation"
								onChange={updateSlider}
							/>
							<br />

							<label htmlFor="lightness">Lightness</label>
							<input
								type="range"
								min="20"
								max="90"
								value={prefs.lightness}
								className="field lightness"
								id="lightness"
								onChange={updateSlider}
							/>
							<br />				
						</div>

						<div className="row">
							<a href="/admin" target="yokie-admin">Admin home</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}