import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Job } from './pages/Job';
import logo from './pages/imgs/logo.png'

function App() {
  return (

    <>
      <header className="top">
          <img className="logo" src={logo} alt="Shubra logo" />
      </header>

      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/job" element={<Job />}></Route>
      </Routes>
    </>
  );
}

export default App;