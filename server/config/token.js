import jwt from "jsonwebtoken"
const genToken=async (userId)=>{
    try {
        if (!process.env.JWT_SECRET) {
           throw new Error("JWT_SECRET not defined");
         }
        const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"10d"})
        return token
    } catch (error) {
        console.log(error)
        return null
    }
}

export default genToken