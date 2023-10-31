import { Link } from "react-router-dom";
import { router } from "../../App"
import geoLogo from "../../assets/geo_logo.svg";
import { startCase } from "lodash";

function NavBar(){
    return (
        <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img src={geoLogo} alt="Geo Engineers Logo" height="25px" />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        {router.routes.find(r => r.path === "/")?.children?.map(rr => ( 
                            <li className="nav-item" key={rr.id}>
                                <Link className="nav-link" aria-current="page" to={rr.path}>{rr.path === "/" ? "Home" : startCase(rr.path)}</Link>
                            </li> 
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;