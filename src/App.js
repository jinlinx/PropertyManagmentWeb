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
  const pages=[
    {
      control:
        <Propertylist />,
      desc: 'Houses'
    },
    {control: <Leaselist />,desc: 'Leases'},
    {
      control: <Tenantlist />,
      desc: 'Tenants'
    },
    {control: <OwnerList />,desc: 'Owners'},
    {control: <Paymentlist />,desc: 'Payments'},
    {control: <WorkerList />, desc: 'Worker'},
    {control: <WorkerCompList />, desc: 'Worker Comp'},
    {control: <Reportlist />,desc: 'Reports'},
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
