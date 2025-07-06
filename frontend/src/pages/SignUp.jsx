import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"
import toast from 'react-hot-toast';
function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const { serverUrl, userData, setUserData } = useContext(userDataContext)
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let {data} = await axios.post(`/api/auth/signup`, {
        name, email, password
      }, { withCredentials: true })
      if(data.success){
        toast.success(data.message)
        setUserData(data.user)
        navigate("/")
      }else toast.error(data.message)

    } catch (error) {
      toast.error(error.message);
    } finally {
      setName("")
      setEmail("")
      setPassword("")
      setLoading(false)
    }
  }


  return (
    <div className='w-full h-screen bg-cover flex justify-center items-center' style={{ backgroundImage: `url(${bg})` }} >
      <form className='w-[90%] max-h-screen py-6 max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleSignUp}>
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Register to <span className='text-blue-400'>Virtual Assistant</span></h1>
        <input type="text" placeholder='Enter your Name' className='w-full  outline-none border-2 border-white bg-transparent  text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e) => setName(e.target.value)} value={name} />
        <input type="email" placeholder='Email' className='w-full  outline-none border-2 border-white bg-transparent  text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e) => setEmail(e.target.value)} value={email} />
        <div className='w-full  border-2 border-white bg-transparent  text-white rounded-full text-[18px] flex items-center pr-2'>
          <input type={showPassword ? "text" : "password"} placeholder='password' className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]' required onChange={(e) => setPassword(e.target.value)} value={password} />
          {!showPassword && <IoEye className=' w-[25px] h-[25px] text-[white] cursor-pointer' onClick={() => setShowPassword(true)} />}
          {showPassword && <IoEyeOff className=' w-[25px] h-[25px] text-[white] cursor-pointer' onClick={() => setShowPassword(false)} />}
        </div>
        <button className='min-w-[150px] py-3 mt-[30px] cursor-pointer text-black font-semibold  bg-white rounded-full text-[17px] ' disabled={loading}>{loading ? "Loading..." : "Sign Up"}</button>

        <p className='text-[white] text-[18px] cursor-pointer' onClick={() => navigate("/signin")}>Already have an account ? <span className='text-blue-400'>Sign In</span></p>
      </form>
    </div>
  )
}

export default SignUp
