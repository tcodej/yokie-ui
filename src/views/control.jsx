import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/application';
import { getPreferences } from '../utils/api';
import { updateInterfaceColors } from '../utils';
import PanelSearch from '../components/panels/panelSearch';
import PanelInfo from '../components/panels/panelInfo';
import PanelPlayer from '../components/panels/panelPlayer';
import PanelQueue from '../components/panels/panelQueue';
import PanelPreferences from '../components/panels/panelPreferences';
import SideButtons from '../components/sideButtons';
import AuthButtons from '../components/authButtons';

export default function Control() {
	const { appState, updateAppState } = useAppContext();
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!loaded) {
			setLoaded(true);
			getPreferences().then((response) => {
				if (response.ok) {
					setLoaded(true);

					updateAppState({
						prefs: response.preferences,
						message: response.message
					});

					updateInterfaceColors(
						response.preferences.hue,
						response.preferences.saturation,
						response.preferences.lightness
					);
				}
			});
		}
	}, [loaded, updateAppState]);

	return (
		<div id="wrapper" className="no-select">
			<div className="overlay"></div>
			<div className="left-pane">
				<PanelSearch />
				<PanelInfo />
			</div>

			<div className="right-pane">
				<PanelPlayer />
				{ appState.showPrefs ? (
					<PanelPreferences />
				) : (
					<PanelQueue />
				)}
			</div>

			<div className="menu-pane">
				<h1 className="ttl-yokie">yokie</h1>
				<SideButtons />
				<AuthButtons />
			</div>
		</div>
	);
}
