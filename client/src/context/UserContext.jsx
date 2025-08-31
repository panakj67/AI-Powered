import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'

export const userDataContext = createContext()

function UserContext({ children }) {
  const serverUrl = "http://localhost:8000"
  const [userData, setUserData] = useState(null)
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`/api/user/current`, { withCredentials: true })
      setUserData(result.data)
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  console.log(userData);

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(`/api/user/asktoassistant`, { command, user : userData?.name }, { withCredentials: true })
      return result.data
    } catch (error) {
      console.error(error?.response?.data || error.message);
      // Return a fallback response to avoid breaking the app
      return { response: "Error from Gemini API.", type: null, userInput: null };
    }
  }

  useEffect(() => {
    handleCurrentUser()
  }, [])

  const value = {
    serverUrl, userData, setUserData, backendImage, setBackendImage, frontendImage, setFrontendImage, selectedImage, setSelectedImage, getGeminiResponse
  }

  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
