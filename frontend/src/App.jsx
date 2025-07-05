import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/Customize2'
import axios from 'axios'

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

function App() {
  const { userData, setUserData } = useContext(userDataContext)
  return (
    <Routes>
      <Route path='/' element={(userData?.assistantImage && userData?.assistantName) ? <Home /> : <Navigate to={"/customize"} />} />
      <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
      <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
      <Route path='/customize' element={userData ? <Customize /> : <Navigate to={"/signup"} />} />
      <Route path='/customize2' element={userData ? <Customize2 /> : <Navigate to={"/signup"} />} />
    </Routes>
  )
}

export default App
