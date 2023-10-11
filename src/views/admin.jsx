import { Fragment } from 'react';
import { useAppContext } from '../contexts/application';

export default function Admin() {
	const { appState } = useAppContext();

	return (
		<div id="page-admin">
			<header id="admin-header">
				<a href="auth/logout" id="logout">log out</a>
				<a href="admin" id="logo">yokie</a>
			</header>

			<div id="admin-container">
				{ appState.useProxy &&
					<div className="row">
						<h3>Admin tasks</h3>
						<ul>
							<li><a href="admin/remote">Remote control</a></li>
							<li><a href="admin/log">View log</a></li>
							<li><a href="admin/booklet">Song booklet</a></li>
						</ul>
					</div>
				}

				{ !appState.useProxy &&
					<Fragment>
						<div className="third">
							<div className="row">
								<h3>Common tasks</h3>
								<ul>
									<li><a href="admin/remote">Remote control</a></li>
									<li><a href="admin/upload">Upload songs</a></li>
									<li><a href="admin/batch">Import uploaded songs</a></li>
									<li><a href="admin/log">View log</a></li>
								</ul>
							</div>
						</div>

						<div className="third">
							<div className="row">
								<h3>Maintenance tasks</h3>
								<ul>
									<li><a href="admin/auditpath">Audit song paths</a></li>
									<li><a href="admin/auditfile">Audit song files</a></li>
									<li><a href="admin/duration">Detect song durations</a></li>
									<li><a href="admin/rename">Rename song files</a></li>
									<li><a href="admin/trash">Empty trash</a></li>
								</ul>
							</div>
						</div>

						<div className="third">
							<div className="row">
								<h3>Other tasks</h3>
								<ul>
									<li><a href="admin/booklet">Song booklet</a></li>
								</ul>
							</div>
						</div>
					</Fragment>
				}
			</div>
		</div>
	);
}
