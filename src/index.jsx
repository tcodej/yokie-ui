import ReactDOM from 'react-dom/client';
import App from './app';
import { ApplicationProvider } from './contexts/application';

ReactDOM.createRoot(document.getElementById('root')).render(
	<ApplicationProvider>
		<App />
	</ApplicationProvider>
)
