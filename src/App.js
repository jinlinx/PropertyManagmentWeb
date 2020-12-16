import React, { useState } from 'react';
import './App.css';
import Propertylist from './components/propertylist';
import Leaselist from './components/leaselist';
import WorkerList from './components/workerList';
import WorkerCompList from './components/workerCompList';
import Paymentlist from './components/paymentlist';
import Reportlist from './components/reportlist';
import Tenantlist from './components/tenantlist';
import OwnerList from './components/ownerList';
import TablePicker from './components/sqlEditor/TablePicker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
//

function App() {

  const [showPage, setShowPage] = useState(0);
  const [pageProps, setPageProps] = useState({});
  const pageState = { pageProps, setPageProps };
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

  const doPageRange = (from, end) => pages.slice(from, end).map((page, who) => {
    return <td className='topButtonTbl' key={who + 10}><button className='blueButton' onClick={() => {
      setShowPage(who + from);
    }}>{page.desc}</button></td>
  })
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
                  <Nav.Link href="#home">Home</Nav.Link>
                  <Nav.Link href="#link">Link</Nav.Link>
                  <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                    <NavDropdown.Item key={0}>Action</NavDropdown.Item>                    
                    {
                      pages.map((p, i) => {
                        return <NavDropdown.Item key={i + 10} onClick={() => {
                          setShowPage(i);
                        }}>{ p.desc}</NavDropdown.Item>
                      })
                    }
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4" key={20}>Developer1</NavDropdown.Item>
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

      </main>

    </div>
  );
}

export default App;
