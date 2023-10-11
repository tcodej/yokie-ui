import { Fragment } from 'react';
import { useAppContext } from '../contexts/application';

export default function AuthButtons() {
	const { appState, updateAppState } = useAppContext();

	const toggleAuth = () => {
		updateAppState({ isAdmin: !appState.isAdmin });
	}

	const togglePrefs = () => {
		updateAppState({ showPrefs: !appState.showPrefs });
	}

	return (
		<div className="buttons-vertical">
			{ appState.isAdmin &&
				<Fragment>
					<button type="button" className="admin preferences icon" title="preferences" onClick={togglePrefs}>preferences</button>
					<button type="button" className="admin logout icon" title="log out">log out</button>
				</Fragment>
			}
			<button type="button" className="auth icon" title="log in" onClick={toggleAuth}>log in</button>
		</div>
	)
}