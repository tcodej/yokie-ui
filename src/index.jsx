import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { ApplicationProvider } from './contexts/application';

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<ApplicationProvider>
			<App />
		</ApplicationProvider>
	</React.StrictMode>
)
