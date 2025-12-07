import jwt from "jsonwebtoken"
const isAuth = async (req,res,next)=>{
    try {
        const token = req.cookies.token
        console.log(process.env.JWT_SECRET);
        
        if(!token || !process.env.JWT_SECRET){
            return res.status(400).json({success : false, message:"You are not authorised!"})
        }
        const verifyToken=await jwt.verify(token,process.env.JWT_SECRET)
        req.userId = verifyToken.userId

        next()

    } catch (error) {
        console.log(error)
        return res.json({success : false, message:"is Auth error"})
    }
}

export default isAuth