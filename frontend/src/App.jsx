import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'

import { userDataContext } from './context/UserContext'
import Home from './pages/Home'

import axios from 'axios'
import { Toaster} from 'react-hot-toast'
import { useEffect } from 'react'

axios.defaults.baseURL = "https://ai-powered-qx4l.onrender.com";
axios.defaults.withCredentials = true;

function App() {
  const { userData, setUserData } = useContext(userDataContext)

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={userData ? <Home /> : <SignIn/>} />
        <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
        <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
      </Routes>
    </>
  );
}

export default App
