import { NavLink, useLocation } from "react-router-dom";
import { router } from "../../App"
import geoLogo from "../../assets/geo_logo.svg";
import { startCase } from "lodash";
import { useRef } from "react";

function NavBar(){

    // this is a hack to re-create the bootstrap nav collapse
    // probably better to use react-bootstrap or reactstrap for proper implementation
    // but this is a plain react solution with html for now
    const nav = useRef(null);

    function toggleNav(e){
        e.preventDefault();
        e.stopPropagation();  // to prevent the click event from bubbling up to the document and closing the nav
        nav.current.classList.toggle("show");
        return false;  // to prevent the click event from bubbling up to the document and closing the nav
    }

    return (
        <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">
                    <img src={geoLogo} alt="Geo Engineers Logo" height="25px" />
                </NavLink>
                <button onClick={toggleNav} className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" ref={nav} id="navbarNav">
                    <ul className="navbar-nav">
                        {router.routes.find(r => r.path === "/")?.children?.map(rr => ( 
                            <li className="nav-item" key={rr.id}>
                                <NavLink className="nav-link" aria-current="page" to={rr.path}>{rr.path === "/" ? "Home" : startCase(rr.path)}</NavLink>
                            </li> 
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;