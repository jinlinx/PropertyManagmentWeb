import React , { useState } from 'react';
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

//

function App() {

  const [showPage, setShowPage] = useState(0);
  const [pageProps, setPageProps] = useState({});
  const pageState = { pageProps, setPageProps };
  const pages=[
    {
      control:
        <Propertylist pageState={pageState} />,
      desc: 'Houses'
    },
    { control: <Leaselist pageState={pageState}/>,desc: 'Leases'},
    {
      control: <Tenantlist pageState={pageState} />,
      desc: 'Tenants'
    },
    { control: <OwnerList pageState={pageState}/>,desc: 'Owners'},
    { control: <Paymentlist pageState={pageState} />,desc: 'Payments'},
    { control: <WorkerList pageState={pageState} />, desc: 'Worker'},
    { control: <WorkerCompList pageState={pageState} />, desc: 'Worker Comp'},
    { control: <Reportlist pageState={pageState} />, desc: 'Reports' },
    { control: <TablePicker pageState={pageState} />, desc: 'TableEditor' },
  ]  

  const doPageRange = (from, end) => pages.slice(from, end).map((page, who) => {
    return <td className='topButtonTbl' key={who + 10}><button className='blueButton' onClick={() => {
      setShowPage(who+from);
    }}>{page.desc}</button></td>
  })
  return (
    <div className="App" >
      
      <table className='topButtonTbl'>
        <tbody>
            <tr>
            <td className='topHeader' colSpan='6' key={0}>Property Management


              </td>

            </tr>
          <tr>
            {
              doPageRange(0,5)
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
            if(showPage===i) {
              return <div key={i}>{p.control}</div>;
            }
            return null;
          })
        }
        
        </main>
      
    </div>
  );
}

export default App;
