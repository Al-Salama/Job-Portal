import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { JobList } from './pages/JobList';

function App() {
  return (

    <>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/joblist" element={<JobList />}></Route>
      </Routes>
    </>
  );
}

export default App;
