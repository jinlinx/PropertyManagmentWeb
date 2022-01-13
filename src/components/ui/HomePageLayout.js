import React, {useState} from "react"
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import SideBar from './sidebar'
import { JJDataRoot, IncomeExpensesContext } from '../reports/rootData';
export default function HomePageLayout(props) {
    const controlsGrp = props.controlsGrp || [];
    return <JJDataRoot>
        <IncomeExpensesContext.Consumer>
            {
                value => {
                    return <Router>
                        <div className="wrapper fontawesome-i2svg-active fontawesome-i2svg-complete">
                            <SideBar controlsGrp={controlsGrp} />
                            <div id="content">               
                                <Routes>
                                    {
                                        controlsGrp.reduce((acc, c) => {
                                            //link(path, element) c(link, links, name)
                                            c.links.forEach((link,keyi) => {
                                                if (!acc.length) {
                                                    acc.push(<Route path={`/`} element={link.element} key={keyi}></Route>)     
                                                }
                                                acc.push(<Route path={`/${c.link}/${link.path}`} element={link.element} key={keyi}></Route>) 
                                            });                                            
                                            return acc;
                                        },[])
                                    }
                                    <Route path="/cashFlowSummary" element={<><div>Test</div></>}>
                                    </Route>
                                    <Route path="/users">
                                    </Route>
                                    <Route path="/">
                                    </Route>
                                </Routes>                                                                
                            </div>
                        </div>
                    </Router>
                }
            }
        </IncomeExpensesContext.Consumer>

    </JJDataRoot>
}

function TopNav() {
    return <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">

            <button type="button" id="sidebarCollapse" className="btn btn-info">
                <i className="fas fa-align-left"></i>
                <span>Toggle Sidebar</span>
            </button>
            <button className="btn btn-dark d-inline-block d-lg-none ml-auto" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <i className="fas fa-align-justify"></i>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="nav navbar-nav ml-auto">
                    <li className="nav-item active">
                        <a className="nav-link" href="#">Page</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Page</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Page</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Page</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
}