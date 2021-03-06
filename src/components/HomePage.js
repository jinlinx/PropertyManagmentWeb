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
import { getOwners } from './aapi';
import LeftMenu from './leftMenu';
import myStyles from './HomePage.css';
import CashFlowReport from './reports/cashflow';
import MaintenanceReport from './reports/maintenanceReport';
import AppOld from '../AppOld';
import logo from '../images/Logo.png'
import PaymentRport from './reports/paymentReport';

import { JJDataRoot, IncomeExpensesContext} from './reports/rootData';
function App() {
    const [owners, setOwners] = useState([]);
    const [curPage, setCurPage] = useState('reports');
    const [ownerInfo, setOwnerInfo] = useState({ ownerID: '', ownerName: '' });
    const [curView, setCurView] = useState('maintenanceReport');

    const [pageProps, setPageProps] = useState({});
    const pageState = { pageProps, setPageProps };
    
    useEffect(() => {
        getOwners().then(owners => {
            //console.log(owners);
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
          
           
            <div id="topNav" className="topNav">
            
                <table>
                    <tbody>
                        <tr>
                            <td rowSpan='2'>
                                    <img src={logo} style={{ width: 200, height: 150 }} /></td>
                            <td colSpan='2' className='TopTitleFont'>Property Management</td>
                            <td colSpan="3"></td>
                        </tr>
                        <tr>
                            <td colSpan='2'></td>
                            <td><Button className='btnTopButton' href="#reports" onClick={() => setCurPage('reports')}>Reports</Button> </td>
                            <td><Button className='btnTopButton' href="#dateEntry" onClick={() => setCurPage('dataEntry')}>Data Entry</Button> </td>
                            <td><Button className='btnTopButton' href="#adminTools" onClick={() => setCurPage('tools')}>Admin Tools</Button> </td>
           
                            <td><NavDropdown title={"Owner:  " + ownerInfo.ownerName} id="basic-nav-dropdown">
                                {
                                    owners.map((p, i) => {
                                        return <NavDropdown.Item key={i} onClick={() => {
                                            //setShowPage(i);
                                            setOwnerInfo(p);
                                        }}>{p.ownerName}</NavDropdown.Item>
                                    })
                                }
 
                            </NavDropdown>
                                       
                                       
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
            <div id="mySidenav" className="sidenav">
                <Container fluid='xl'  >
                    <Row>
                        <Col>
                            <Container>
                                <Row className="justify-content-md-left">
                                    <Col>
                                        {
                                            curPage === 'reports' && <>
                                               
                                                    <Button className='btn-LeftMenuButton' onClick={() => setCurView('cashFlowSummary')}>Cash Flow Summary Report</Button><br></br><br></br>
                                                    <Button className='btn-LeftMenuButton' onClick={() => setCurView('maintenanceReport')}>House Maintenance Report</Button><br></br><br></br>
                                                    <Button className='btn-LeftMenuButton' onClick={() => setCurView('paymentReport')}>Payment Report</Button><br></br><br></br>
                                                    <Button className='btn-LeftMenuButton' >Worker Compensation Report</Button><br></br>
                                  
                                            </>
                                        }
                                        {
                                            curPage === 'dataEntry' && <>
                                                <Button className='btn-LeftMenuButton' >House Maintenance Data Entry</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' >Payment Data Entry</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('houseInfo')}>House Info Data Entry</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' >Lease Data Entry</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' >Tenants Data Entry</Button><br></br><br></br>
                                            </>
                                        }
                                        {
                                            curPage === 'tools' && <>
                                                <Button className='btn-LeftMenuButton' >Owners Info</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' >Workers Info</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' >Expanse Category List</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('developer')}>Developer Tools</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('oldapp')}>OldApp</Button><br></br><br></br>
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
            <JJDataRoot>

            
                <div className='divMain'>
                    <IncomeExpensesContext.Consumer>
                        {
                            value => {
                                if (curView === 'cashFlowSummary') return <CashFlowReport jjctx={value} />
                                if (curView === 'maintenanceReport') return <MaintenanceReport jjctx={value} />
                                if (curView === 'developer') return <div><Developer /></div>
                                if (curView === 'oldapp') return <div><AppOld /></div>
                                if (curView === 'paymentReport') return <PaymentRport jjctx={value} />
                                if (curView === 'houseInfo') return <Propertylist  pageState={pageState} />
                            }
                        }
                
                    </IncomeExpensesContext.Consumer>
                </div>
            </JJDataRoot>
        </>
    );
}

export default App;
