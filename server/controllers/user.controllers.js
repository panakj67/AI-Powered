//import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"

export const getCurrentUser = async (req, res) => {
   try {
      const userId = req.userId
      const user = await User.findById(userId).select("-password").populate("chats");
      if (!user) {
         return res.status(400).json({ message: "user not found" })
      }

      return res.status(200).json(user)
   } catch (error) {
      return res.status(400).json({ message: "get current user error" })
   }
}


export const askToAssistant = async (req, res) => {
   try {
      const { command } = req.body
      const user = await User.findById(req.userId);
      
      const userName = user.name
      const result = await geminiResponse(command, userName)

      const jsonMatch = result.match(/{[\s\S]*}/)
      if (!jsonMatch) {
         return res.ststus(400).json({ response: "sorry, i can't understand" })
      }
      const gemResult = JSON.parse(jsonMatch[0])
      console.log(gemResult)
      const type = gemResult.type

      switch (type) {
         case 'get-date':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: `current date is ${moment().format("YYYY-MM-DD")}`
            });
         case 'get-time':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: `current time is ${moment().format("hh:mm A")}`
            });
         case 'get-day':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: `today is ${moment().format("dddd")}`
            });
         case 'get-month':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: `today is ${moment().format("MMMM")}`
            });
         case 'google-search':
         case 'youtube-search':
         case 'youtube-play':
         case 'general':
         case "calculator-open":
         case "instagram-open":
         case "facebook-open":
         case "weather-show":
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: gemResult.response,
            });
          case 'gmail-send':
            return res.json({
               type,
               userInput: gemResult.userInput,
               response: gemResult.response,
               email: gemResult.email,
               subject: gemResult.subject,
               body: gemResult.body,
            });

         default:
            return res.status(400).json({ response: "I didn't understand that command." })
      }


   } catch (error) {
      return res.status(500).json({ response: "ask assistant error" })
   }
}