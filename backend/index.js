import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"


const app=express()

connectDb()

app.use(cors({
    origin:"http://localhost:5173" || process.env.FRONTEND_URL,
    credentials:true
}))

const port=process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Api is working!!")
})

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)


app.listen(port,()=>{
    console.log("Server is running on PORT 3000 !!")
})

