import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Job } from './pages/Job';
import logo from './pages/imgs/logo.png'
import './assets/global.css';

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

      <footer>
        <div>
          <h4>شركة شبرا الطائف التجارية</h4>
          <p>
            جميع الحقوق محفوظة © 2023
          </p>
        </div>

        <div className='links'>
            <Link target={"_blank"} style={{color: "#24789f"}} to={"https://api.whatsapp.com/send?phone=966920022102"}>
              <i class="fa-brands fa-whatsapp"></i>
            </Link>

            <Link target={"_blank"} style={{color: "#24789f"}} to={"https://twitter.com/shubra_sa"}>
              <i class="fa-brands fa-twitter"></i>
            </Link>

            <Link target={"_blank"} style={{color: "#24789f"}} to={"https://www.instagram.com/shubra_sa/"}>
              <i class="fa-brands fa-instagram"></i>
            </Link>

            <a rel="noreferrer" target="_blank" style={{color: "#24789f"}} href="mailto:onlinestore@shubra.net">
              <i class="fa-regular fa-envelope"></i>
            </a>

            <Link target={"_blank"} style={{color: "#24789f"}} to={"https://www.snapchat.com/add/shubra_sa"}>
              <i class="fa-brands fa-snapchat"></i>
            </Link>

            <Link target={"_blank"} style={{color: "#24789f"}} to={"https://www.facebook.com/shubra.sa/"}>
              <i class="fa-brands fa-facebook-f"></i>
            </Link>

        </div>
      </footer>
    </>
  );
}

export default App;