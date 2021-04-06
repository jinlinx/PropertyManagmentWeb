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
import TenantPaymentMethodMapping from './reports/TenantPaymentMethodMapping';
import AppOld from '../AppOld';
import logo from '../images/Logo.png'
import PaymentRport from './reports/paymentReport';
import ExepenseCategory from './dataEntry/expenseCategory';
import MaintanceList from './maintenanceList';
import MonthlyComp from './reports/monthlyComp';
import { showOwner } from './util';
    
import { JJDataRoot, IncomeExpensesContext} from './reports/rootData';
function App() {
    const [owners, setOwners] = useState([]);
    const [curPage, setCurPage] = useState('reports');
    const [ownerInfo, setOwnerInfo] = useState({ ownerID: '', ownerName: '' });
    const [curView, setCurView] = useState('maintenanceReport');

    const [pageProps, setPageProps] = useState({});
    const pageState = { pageProps, setPageProps, ownerInfo };
    
    useEffect(() => {
        getOwners().then(owners => {
            //console.log(owners);
            if (owners) {
                setOwners(owners);
                setOwnerInfo(owners[0] || {});
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
                            <td rowSpan='1'>
                                    <img src={logo} style={{ width: 200, height: 50 }} /></td>
                            <td colSpan='2' className='TopTitleFont'>Property Management</td>
                            <td><Button className='btnTopButton' href="#reports" onClick={() => setCurPage('reports')}>Reports</Button> </td>
                            <td><Button className='btnTopButton' href="#dateEntry" onClick={() => setCurPage('dataEntry')}>Data Entry</Button> </td>
                            <td><Button className='btnTopButton' href="#adminTools" onClick={() => setCurPage('tools')}>Admin Tools</Button> </td>
           
                            {
                                showOwner() && <td><NavDropdown title={"Owner:  " + ownerInfo.ownerName} id="basic-nav-dropdown">
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
                            }
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
                                                    <Button className='btn-LeftMenuButton' onClick={() => setCurView('workerCompensationReport')}>Worker Compensation Report</Button><br></br>
                                  
                                            </>
                                        }
                                        {
                                            curPage === 'dataEntry' && <>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('maintenanceList')}>House Maintenance Data Entry</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('Paymentlist')}>Payment Data Entry</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('Propertylist')}>House Info Data Entry</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('TenantPaymentMethodMapping')}>Tenant Method</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('Leaselist')}>Lease Data Entry</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('tenantlist')}>Tenants Data Entry</Button><br></br><br></br>
                                            </>
                                        }
                                        {
                                            curPage === 'tools' && <>
                                                <Button className='btn-LeftMenuButton' onClick={()=>setCurView('OwnerList')}>Owners Info</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={()=>setCurView('workerCompList')}>Worker Compensiation</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={()=>setCurView('expenseCategory')}>Expanse Category List</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('developer')}>Developer Tools</Button><br></br><br></br>
                                                <Button className='btn-LeftMenuButton' onClick={() => setCurView('oldapp')}>OldApp</Button><br></br><br></br>
                                                <Button className='btn-leftMenuButton' onClick={()=>setCurView('importPayments')}>Import Payments</Button>
                                            </>
                                        }
                                    </Col>
                                </Row>
        
                            </Container>
                        </Col>
                        <Col md="auto"></Col>
                    </Row>
                </Container>
            </div>
            <JJDataRoot dataRootParam ={{ownerInfo}}>

            
                <div className='divMain'>
                    <IncomeExpensesContext.Consumer>
                        {
                            value => {
                                if (curView === 'cashFlowSummary') return <CashFlowReport jjctx={value} />
                                if (curView === 'maintenanceReport') return <MaintenanceReport jjctx={value} />
                                if (curView === 'developer') return <div><Developer /></div>
                                if (curView === 'oldapp') return <div><AppOld /></div>
                                if (curView === 'paymentReport') return <PaymentRport jjctx={value} />
                                if (curView === 'Propertylist') return <Propertylist pageState={pageState} />
                                if (curView === 'Paymentlist') return <Paymentlist pageState={pageState} />
                                if (curView === 'TenantPaymentMethodMapping') return <TenantPaymentMethodMapping />
                                if (curView === 'Leaselist') return <Leaselist pageState={pageState} />
                                if (curView === 'OwnerList') return <OwnerList pageState={pageState} />
                                if (curView === 'expenseCategory') return <ExepenseCategory pageState={pageState}></ExepenseCategory>
                                if (curView === 'workerCompensationReport') return <MonthlyComp></MonthlyComp>
                                if (curView === 'tenantlist') return <Tenantlist pageState={pageState} ></Tenantlist>
                                if (curView === 'maintenanceList') return <MaintanceList pageState={pageState} ></MaintanceList>
                                if (curView === 'workerCompList') return <WorkerCompList  pageState={pageState}></WorkerCompList>
                                if (curView ==='importPayments') return <Reportlist pageState={pageState} />
                                return <span>Not implemented {curView}</span>
                            }
                        }
                
                    </IncomeExpensesContext.Consumer>
                </div>
            </JJDataRoot>
        </>
    );
}

export default App;
