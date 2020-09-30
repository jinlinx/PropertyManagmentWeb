import React , { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Propertylist from './components/propertylist';
import Leaselist from './components/leaselist';
import Maintaneselist from './components/maintaneselist';
import Paymentlist from './components/paymentlist';
import Reportlist from './components/reportlist';
import Tenantlist from './components/tenantlist';
import OwnerList from './components/ownerList';

//

function App() {

  const [showPage, setShowPage] = useState(0);
  const pages = [ <Propertylist />, <Leaselist />, <Tenantlist/>, <OwnerList/>, <Paymentlist/>,<Maintaneselist/>, <Reportlist/>]
  return (
    <div className="App" >
      
      <table class='topButtonTbl'>
            <tr>
              <td class='topHeader' colSpan='6'>Property Management


              </td>

            </tr>
          <tr>
            <td class='topButtonTbl'><button class='blueButton' onClick={() => {
              setShowPage(1);
            }}>Houses</button></td>
            <td class='topButtonTbl'><button class='blueButton' onClick={() => {
              setShowPage(2);
            }}>Leases</button></td>
            <td class='topButtonTbl'><button class='blueButton' onClick={() => {
              setShowPage(3);
          }}>Tenants</button></td>
           <td class='topButtonTbl'><button class='blueButton' onClick={() => {
              setShowPage(4);
            }}>Owners</button></td>
            <td class='topButtonTbl'><button class='blueButton' onClick={() => {
              setShowPage(5);
            }}>Payments</button></td>
            <td class='topButtonTbl'><button class='blueButton' onClick={() => {
              setShowPage(6);
            }}>Maintanese</button></td>
            <td class='topButtonTbl'><button class='blueButton' onClick={() => {
              setShowPage(7);
            }}>Reports</button></td>
        </tr>

          </table>
      <main>
        {
          //adfasdf
          pages.map((p, i) => {
            if (showPage === i +1)
              return p;
          })
        }
        
        </main>
      
    </div>
  );
}

export default App;
