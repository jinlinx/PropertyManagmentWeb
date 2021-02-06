import React, { useState, useEffect } from 'react';

import Propertylist from './propertylist';
import Leaselist from './leaselist';
import WorkerList from './workerList';
import WorkerCompList from './workerCompList';
import Paymentlist from './paymentlist';
import Reportlist from './reportlist';
import Tenantlist from './tenantlist';
import OwnerList from './ownerList';
import TablePicker from './sqlEditor/TablePicker';
import Developer from './Developer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button,Container, Row, Col } from 'react-bootstrap';
import HomePage from './HomePage';
import { getOwners } from './aapi';
import LeftMenu from './leftMenu';
import myStyles from './HomePage.css';
import CashFlowReport from './reports/cashflow';
import MaintenanceReport from './reports/maintenanceReport';
import AppOld from '../AppOld';

function App() {
    const [owners, setOwners] = useState([]);
    const [curPage, setCurPage] = useState('reports');
    const [ownerInfo, setOwnerInfo] = useState({ ownerID: '', ownerName: '' });
    const [curView, setCurView] = useState('maintenanceReport')
    useEffect(() => {
        getOwners().then(owners => {
            console.log(owners);
            if (owners) {
                setOwners(owners);
                setOwnerInfo(owners[1] || {});
            }
        }).catch(err => {
            console.log('network failed');
        })
    }, []);
    
    /*return <HomePage/>*/
    return (
        <>
            <div>
            <Navbar bg="light" expand="lg">
                                <Navbar.Brand href="#home">Property Management</Navbar.Brand>
                                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                                <Navbar.Collapse id="basic-navbar-nav">
                                    <Nav className="mr-auto">
                                        <Nav.Link href="#reports" onClick={() => setCurPage('reports')}>Reports</Nav.Link>
                                        <Nav.Link href="#dateEntry" onClick={() => setCurPage('dataEntry')}>Data Entry</Nav.Link>
                                        <Nav.Link href="#adminTools" onClick={() => setCurPage('tools')}>Admin Tools</Nav.Link>
                                        <NavDropdown title={"Owner:  " + ownerInfo.ownerName} id="basic-nav-dropdown">
                                            {
                                                owners.map((p, i) => {
                                                    return <NavDropdown.Item key={i} onClick={() => {
                                                        //setShowPage(i);
                                                        setOwnerInfo(p);
                                                    }}>{p.ownerName}</NavDropdown.Item>
                                                })
                                            }
                                        </NavDropdown>
                  
                                    </Nav>
                
                                </Navbar.Collapse>
                            </Navbar>
            </div>
            <div id="mySidenav" class="sidenav">
            <Container fluid='xl'  >
                    <Row>
                        <Col>
                            <Container>
                                <Row className="justify-content-md-left">
                                    <Col>
                                        {
                                            curPage === 'reports' && <>
                                                <ui>
                                                    <Button onClick={()=>setCurView('cashFlowSummary')}>Cash Flow Summary Report</Button><br></br><br></br>
                                                    <Button onClick={()=>setCurView('maintenanceReport')}>House Maintenance Report</Button><br></br><br></br>
                                                    <Button>Payment Report</Button><br></br><br></br>
                                                    <Button>Worker Compensation Report</Button><br></br>
                                                </ui>
                                            </>
                                        }
                                        {
                                            curPage === 'dataEntry' && <>
                                                <Button>House Maintenance Data Entry</Button><br></br><br></br>
                                                <Button>Payment Data Entry</Button><br></br><br></br>
                                                <Button>House Info Data Entry</Button><br></br><br></br>
                                                <Button>Lease Data Entry</Button><br></br><br></br>
                                                <Button>Tenants Data Entry</Button><br></br><br></br>
                                            </>
                                        }
                                        {
                                            curPage === 'tools' && <>
                                                <Button>Owners Info</Button><br></br><br></br>
                                                <Button>Workers Info</Button><br></br><br></br>
                                                <Button>Expanse Category List</Button><br></br><br></br>
                                                <Button onClick={() => setCurView('developer')}>Developer Tools</Button><br></br><br></br>
                                                <Button onClick={() => setCurView('oldapp')}>OldApp</Button><br></br><br></br>
                                            </>
                                        }
                                    </Col>
                                </Row>
        
                            </Container>
                        </Col>
                        <Col md="auto"></Col>
                    </Row>
                </Container>
                <NavDropdown title={"Owner:  " + ownerInfo.ownerName} id="basic-nav-dropdown">
                                            {
                                                owners.map((p, i) => {
                                                    return <NavDropdown.Item key={i} onClick={() => {
                                                        //setShowPage(i);
                                                        setOwnerInfo(p);
                                                    }}>{p.ownerName}</NavDropdown.Item>
                                                })
                                            }
                                        </NavDropdown>
            </div>
            <div style={{marginLeft:'255px', marginTop:30}}>
                TODO: Data
                 {
                    curView ==='cashFlowSummary' && <CashFlowReport />
                }
                {
                    curView ==='maintenanceReport' && <MaintenanceReport />
                }
                {
                    curView ==='developer' && <div><Developer/></div>
                }
                {
                    curView === 'oldapp' && <div><AppOld /></div>
                }
            </div>
        </>
    );
}

export default App;
