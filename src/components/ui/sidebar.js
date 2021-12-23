import React from "react"
import {    
    Link
} from "react-router-dom";
import { SideBarItem } from './sidebarGroupControl'
export default function SideBar(props) {
    const controlsGrp = props.controlsGrp;
    const components = [
        {
            name: 'Reports',
            link: '/reports',
            links: [
                'cashFlowSummary',
                'houseMaintence',
                'paymentReport',
                'workerComp'
            ]
        },
        {
            name: 'DataEntry',
            link: '/dataEntry',
            links: [
                'houseMaintenance',
                'payment',
                'houseInfo',
                'Lease Data',
                'Tenants'
            ]
        },
        {
            name: 'Admin Tools',
            link: '/adminTools',
            links: [
                'workerComp',
                'expenseCategory',
                'devTools',
                'importPayments'
            ]
        }
    ]
    return <nav id="sidebar">
        <div className="sidebar-header">
            <h3>Bootstrap Sidebar</h3>
        </div>

        <ul className="list-unstyled components">
            {
                controlsGrp.map(comp => {
                    return <SideBarItem name={ comp.name || comp.link} children={
                        comp.links.map(link => <li><Link to={ `/${comp.link}/${link.path}`}>{ link.name || link.path}</Link></li>)
                    }></SideBarItem>
                })
            }
            <SideBarItem name="Home11" children={
                [<li><a href='#'>test</a></li>]
            }>

            </SideBarItem>
            <p>Dummy Heading</p>
            <li className="active">
                <a href="#homeSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle">Home</a>
                <ul className="collapse list-unstyled" id="homeSubmenu">
                    <li>
                        <a href="#">Home 1</a>
                    </li>
                    <li>
                        <a href="#">Home 2</a>
                    </li>
                    <li>
                        <a href="#">Home 3</a>
                    </li>
                </ul>
            </li>
            <li>
                <a href="#">About</a>
            </li>
            <li>
                <a href="#pageSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle">Pages</a>
                <ul className="collapse list-unstyled" id="pageSubmenu">
                    <li>
                        <a href="#">Page 1</a>
                    </li>
                    <li>
                        <a href="#">Page 2</a>
                    </li>
                    <li>
                        <a href="#">Page 3</a>
                    </li>
                </ul>
            </li>
            <li>
                <a href="#">Portfolio</a>
            </li>
            <li>
                <a href="#" >Contact</a>
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