import React , { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Propertylist from './components/propertylist';

function App() {

  const [showPage, setShowPage] = useState(0);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <input value="test"></input>
        <button onClick={() => { 
          setShowPage(1);
        }}>Show Property List</button>
        <button onClick={() => { 
          setShowPage(2);
        }}>Show User List</button>
        test hellow
        {showPage == 1 &&
          <Propertylist />
        }
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
