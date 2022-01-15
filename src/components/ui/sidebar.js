import React from "react"
import {    
    Link
} from "react-router-dom";
import { SideBarItem } from './sidebarGroupControl'
export default function SideBar(props) {
    const controlsGrp = props.controlsGrp;    
    return <nav id="sidebar">
        <div className="sidebar-header">
            <h3>Property Mgmt</h3>
        </div>

        <ul className="list-unstyled components">
            {
                controlsGrp.map((comp,keyi) => {
                    return <SideBarItem key={keyi} name={ comp.name || comp.link} children={
                        comp.links.map((link, ckeyi) => <div key={ckeyi}><Link to={ `/${comp.link}/${link.path}`}>{ link.name || link.path}</Link></div>)
                    }></SideBarItem>
                })
            }
        </ul>
    </nav>
}

function Test() {
    return <nav id="sidebar">
        <div className="sidebar-header">
            <h3>Property Mgmt</h3>
        </div>

        <ul className="list-unstyled components">
            <p>Testing</p>
            <li>
                <a href="#">About</a>
            </li>
            <li>
                <a href="#pageSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle">Pages</a>
                <ul className="collapse list-unstyled" id="pageSubmenu">
                    <li>
                        <a href="#">Page 1</a>
                    </li>
                </ul>
            </li>
        </ul>

        <ul className="list-unstyled CTAs">
            <li>
                <a href="#" className="download">Developer tools</a>
            </li>
            <li>
                <a href="#" className="article">Back </a>
            </li>
        </ul>
        <ul className="list-unstyled CTAs">
        </ul>
    </nav>
}