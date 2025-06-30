import React from 'react';
import './App.css';
import NavBar from './components/NavBar/NavBar';
import Upload from './components/Upload/Upload';

function App() {
  return (
<>
  <div className='App-header'>
    <NavBar />
    <Upload />
    {/* Rest of your app content goes here */}
  </div>
</>
);
}

export default App;