import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import chatRouter from "./routes/chat.routes.js"
import healthRouter from "./routes/health.routes.js";
import { connectRedis } from "./config/redis.js";
import { createApiRateLimiter } from "./middleware/rateLimiter.js";
import { createSessionMiddleware } from "./middleware/session.middleware.js";

const app=express()

connectDb()
connectRedis().catch((error) => {
    console.error("[redis] connection bootstrap failed", error?.message || error)
})

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}))

const port=process.env.PORT || 3000
app.use(express.json())
app.use(cookieParser())
app.use(createSessionMiddleware())
app.use(createApiRateLimiter())

app.get("/", (req, res) => {
    res.send("Api is working!!")
})

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/chat", chatRouter)
app.use("/health", healthRouter)

app.listen(port,()=>{
    console.log(`Server is running on PORT ${port} !!`)
})
