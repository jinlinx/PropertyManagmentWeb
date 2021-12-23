import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './bs.css';
import Propertylist from './components/propertylist';
import Leaselist from './components/leaselist';
import WorkerList from './components/workerList';
import WorkerCompList from './components/workerCompList';
import Paymentlist from './components/paymentlist';
import Reportlist from './components/reportlist';
import Tenantlist from './components/tenantlist';
import OwnerList from './components/ownerList';
import TablePicker from './components/sqlEditor/TablePicker';
import Developer from './components/Developer';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import HomePage from './components/HomePage';
import HomePageNew from './components/ui/HomePageLayout';
import { getOwners } from './components/aapi';
import LeftMenu from './components/leftMenu';

function App() {

  const [showPage, setShowPage] = useState(0);
  const [pageProps, setPageProps] = useState({});
  const pageState = { pageProps, setPageProps };
  const [owners, setOwners] = useState([]);
  const [ownerInfo, setOwnerInfo] = useState({ ownerID: '', ownerName:''});
  useEffect(() => {
    getOwners().then(owners => {
      console.log(owners);
      setOwners(owners);
      setOwnerInfo(owners[1]);
    }).catch(err => {
      console.log('Error get owners in app.js');
    })
  },[]);
  const pages = [
    {
      control:
        <Propertylist pageState={pageState} />,
      desc: 'Houses'
    },
    { control: <Leaselist pageState={pageState} />, desc: 'Leases' },
    {
      control: <Tenantlist pageState={pageState} />,
      desc: 'Tenants'
    },
    { control: <OwnerList pageState={pageState} />, desc: 'Owners' },
    { control: <Paymentlist pageState={pageState} />, desc: 'Payments' },
    { control: <WorkerList pageState={pageState} />, desc: 'Worker' },
    { control: <WorkerCompList pageState={pageState} />, desc: 'Worker Comp' },
    { control: <Reportlist pageState={pageState} />, desc: 'Reports' },
    { control: <TablePicker pageState={pageState} />, desc: 'TableEditor' },
  ]

  const devPages = [
    {
      control: <Developer />,
      desc: 'Developer',
    }
  ]
  const doPageRange = (from, end) => pages.slice(from, end).map((page, who) => {
    return <td className='topButtonTbl' key={who + 10}><button className='blueButton' onClick={() => {
      setShowPage(who + from);
    }}>{page.desc}</button></td>
  })
  return <HomePageNew />;
  return (
    <div className="App" >
      <table>
        <tbody>          
          <tr><td colSpan='6' key={1}>
            <Navbar bg="light" expand="lg">
              <Navbar.Brand href="#home">Property Management</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                  <Nav.Link href="#reports">Reports</Nav.Link>
                  <Nav.Link href="#dateEntry">Data Entry</Nav.Link>
                  <Nav.Link href="#adminTools">Admin Tools</Nav.Link>
                  <NavDropdown title={"Owner:" +ownerInfo.ownerName} id="basic-nav-dropdown">                   
                    {
                      owners.map((p, i) => {
                        return <NavDropdown.Item key={i} onClick={() => {
                          //setShowPage(i);
                          setOwnerInfo(p);
                        }}>{p.ownerName}</NavDropdown.Item>
                      })
                    }
                  </NavDropdown>
                  <NavDropdown title="Developer" id="basic-nav-dropdown">                    
                    {
                      devPages.map((p, i) => {
                        return <NavDropdown.Item key={i + 100} onClick={() => {
                          setShowPage(i+100);
                        }}>{p.desc}</NavDropdown.Item>
                      })
                    }                    
                  </NavDropdown>
                </Nav> 
                <Form inline>
                  <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                  <Button variant="outline-success">Search</Button>
                </Form>
              </Navbar.Collapse>
            </Navbar>
          </td></tr>
          <tr>
            {
              doPageRange(0, 5)
            }
          </tr>
          <tr>
            {
              doPageRange(5, 10)
            }
          </tr>
        </tbody>
      </table>
      <main>
        {
          //adfasdf
          pages.map((p, i) => {
            if (showPage === i) {
              return <div key={i+10}>{p.control}</div>;
            }
            return null;
          })
        }
        {
          //adfasdf
          devPages.map((p, i) => {
            if (showPage === i+100) {
              return <div key={i + 10}>{p.control}</div>;
            }
            return null;
          })
        }
      </main>

    </div>
  );
}

export default App;
