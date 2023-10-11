import {
	BrowserRouter,
	Routes,
	Route
} from 'react-router-dom';
import Home from './views/home';
import Control from './views/control';
import Admin from './views/admin';
import Error404 from './views/error404';
import './assets/scss/main.scss';
import './assets/scss/mobile.scss';
import './assets/scss/admin.scss';

export default function App() {
	return (
		<BrowserRouter basename="/">
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="control/" element={<Control />} />
				<Route path="admin/" element={<Admin />} />
				<Route path="*" element={<Error404 />} />
			</Routes>
		</BrowserRouter>
	)
}
