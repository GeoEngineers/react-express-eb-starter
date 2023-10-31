import { Outlet } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import * as pkg from '../../../../package.json';

function Layout() {

	return (
		<div className="container-fluid d-flex flex-column justify-content-between h-100">
			<div className="row">
				<NavBar/>
			</div>
			<div className="row flex-grow-1 p-3">
				<Outlet/>
			</div>
			<footer className="row">
				<p className="text-center">
					<small>
						&copy; {new Date().getFullYear()} - GeoEngineers, Inc.
						| v. {pkg.version}
					</small>
				</p>
			</footer>
		</div>
  	);
}

export default Layout;
