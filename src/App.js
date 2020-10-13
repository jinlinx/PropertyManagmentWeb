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

//

function App() {

  const [showPage, setShowPage] = useState(0);
  const [pageProps, setPageProps] = useState({});
  const pages=[
    {
      control:
        <Propertylist  pageState={pageProps, setPageProps} />,
      desc: 'Houses'
    },
    {control: <Leaselist pageState={pageProps, setPageProps}/>,desc: 'Leases'},
    {
      control: <Tenantlist pageState={pageProps, setPageProps} />,
      desc: 'Tenants'
    },
    {control: <OwnerList  pageState={pageProps, setPageProps}/>,desc: 'Owners'},
    {control: <Paymentlist pageState={pageProps, setPageProps} />,desc: 'Payments'},
    {control: <WorkerList pageState={pageProps, setPageProps} />, desc: 'Worker'},
    {control: <WorkerCompList pageState={pageProps, setPageProps} />, desc: 'Worker Comp'},
    {control: <Reportlist pageState={pageProps, setPageProps} />,desc: 'Reports'},
  ]  
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
              pages.map((page,who) => {
                return <td className='topButtonTbl' key={who+10}><button className='blueButton' onClick={() => {
                  setShowPage(who);
                }}>{page.desc}</button></td>
              })
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
