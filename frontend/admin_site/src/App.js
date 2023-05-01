import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import logo from './assets/imgs/logo.png'
import './assets/global.css'
import settings from './data/settings';

const Home = lazy(() => {
  return import("./pages/Home");
})

const Submission = lazy(() => {
  return import("./pages/Submission");
})

const Settings = lazy(() => {
  return import("./pages/Settings");
})

const Jobs = lazy(() => {
  return import("./pages/Jobs");
})

let g_adminInfo, g_setAdminInfo;
function App() {
  const [adminInfo, setAdminInfo] = useState({});
  g_adminInfo = adminInfo;
  g_setAdminInfo = setAdminInfo;

  const authed = useRef(false);
  useEffect(() => {
    if (authed.current) return;
    authed.current = true;
    authClient();
  }, [])

  useEffect(() => {
    if (!adminInfo) return;
    if (!adminInfo.loggedIn) {
      const pathName = window.location.pathname;
      if (adminInfo.loggedIn === false && !pathName.startsWith("/login")) window.location.replace("/login");
      return;
    }

    const hamburger = document.querySelector("button.hamburger");
    hamburger.addEventListener("click", toggleHamburger)

    return () => {
      hamburger.removeEventListener("click", toggleHamburger)
    }
  }, [adminInfo])

  return (
    <>
      <header className="top">
        {/* <img className="logo" src={logo} alt="Shubra logo" /> */}
        {getHeaderComponents()}
      </header>

      {getHamburgerMenuIfLoggedIn()}

      <Routes>
        <Route path="/" element={<MainHome />}></Route>
        <Route path="/submission" element={<MainSubmission />}></Route>
        <Route path="/settings" element={<MainSettings />}></Route>
        <Route path="/jobs" element={<MainJobs />}></Route>

        <Route path="/login" element={<Login />}></Route>
      </Routes>
    </>
  )
}

function MainHome() {
  return g_adminInfo.loggedIn ? (
    <Suspense fallback={<h1>Loading ...</h1>}>
      <Home />
    </Suspense>
  ) : (g_adminInfo.loggedIn === false) ? (
    <h1>Redirecting you...</h1>
  ) : (
    <h1>Loading ...</h1>
  )
}

function MainSubmission() {
  return g_adminInfo.loggedIn ? (
    <Suspense fallback={<h1>Loading ...</h1>}>
      <Submission />
    </Suspense>
  ) : (g_adminInfo.loggedIn === false) ? (
    <h1>Redirecting you...</h1>
  ) : (
    <h1>Loading ...</h1>
  )
}

function MainSettings() {
  return g_adminInfo.loggedIn ? (
    <Suspense fallback={<h1>Loading ...</h1>}>
      <Settings />
    </Suspense>
  ) : (g_adminInfo.loggedIn === false) ? (
    <h1>Redirecting you...</h1>
  ) : (
    <h1>Loading ...</h1>
  )
}

function MainJobs() {
  return g_adminInfo.loggedIn ? (
    <Suspense fallback={<h1>Loading ...</h1>}>
      <Jobs />
    </Suspense>
  ) : (g_adminInfo.loggedIn === false) ? (
    <h1>Redirecting you...</h1>
  ) : (
    <h1>Loading ...</h1>
  )
}

function toggleHamburger(e) {
  this.parentElement.classList.toggle("active")
}

async function authClient() {
  let response;
  let adminInfo = {};
  try {
    response = await fetch(`${settings.api}/auth`, {
      method: "POST",
      credentials: "include",
      redirect: "manual"
    });
    console.log("ff")
  } finally {
    adminInfo.loggedIn = response ? response.ok : false
    if (adminInfo.loggedIn) {
      const jsonResponse = await response.json();
      delete jsonResponse.success;

      adminInfo = {
        loggedIn: true,
        ...jsonResponse
      }
    }
  }

  g_setAdminInfo(adminInfo);
  return adminInfo;
}

function goBack(event) {
  const pathName = window.location.pathname;
  if (pathName.startsWith("/login")) return;

  window.history.back();
}

function goForward(event) {
  const pathName = window.location.pathname;
  if (pathName.startsWith("/login")) return;

  window.history.forward();
}

function getHeaderComponents() {
  return g_adminInfo && g_adminInfo.loggedIn ? (
    <>
      <div className='right-h'>
        <button className='form-button' onClick={goForward}>
          تقدم
        </button>
        <button className='form-button' onClick={goBack}>
          تراجع
        </button>
      </div>
      <div className='center-h'>
        <img className="logo" src={logo} alt="Shubra logo" />
      </div>
      <div className='left-h'>
        {g_adminInfo.username}
      </div>
    </>
  ) : (
    <img className="logo" src={logo} alt="Shubra logo" />
  )
}

function getHamburgerMenuIfLoggedIn() {
  return g_adminInfo && g_adminInfo.loggedIn ? (
    <div className="mover">
      <button className="hamburger">
        <i className="fas fa-bars"></i>
      </button>

      <div className="sidebar">
        <ul>
          <li>
            <a href="/">
              <span className="icon"><i className="fas fa-home"></i></span>
              <span className="item">الرئيسية</span>
            </a>
          </li>
          <li>
            <a href="/jobs">
              <span className="icon"><i className="fas fa-desktop"></i></span>
              <span className="item">مدير الوظائف</span>
            </a>
          </li>

          <li>
            <a href="/settings">
              <span className="icon"><i className="fas fa-toolbox"></i></span>
              <span className="item">الإعدادات</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  ) : undefined
}

function getAdminInfo(infoName) {
  return (g_adminInfo && g_adminInfo[infoName]) || null;
}

export {
  App as default,
  getAdminInfo
};
