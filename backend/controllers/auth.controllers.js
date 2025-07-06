import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existEmail = await User.findOne({ email })
        if (existEmail) {
            return res.json({ success : false, message: "email already exists !" })
        }
        if (password.length < 6) {
            return res.json({ success : false, message: "password must be at least 6 characters !" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name, password: hashedPassword, email
        })

        const token = await genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: false
        })

        return res.json({ success : true, message: "Account created successfully!!" , user})

    } catch (error) {
        return res.json({ success : false, message: `sign up error ${error}` })
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success : false, message: "User does not exists !" })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success : false, message: "Invalid email or password !!" })
        }

        const token = await genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: false
        })

        return res.json({ success : true, message: "Account created successfully!!" , user})

    } catch (error) {
        return res.json({success : false, message: `login error ${error}` })
    }
}

export const logOut = async (req, res) => {
    console.log("logging out!");
    
    try {
        res.clearCookie("token")
        return res.json({ success : true, message: "log out successfully" })
    } catch (error) {
        return res.json({success : false, message: `logout error ${error}` })
    }
}

export const fetchCurrentUser = (req, res) => {
    try {
        const userId = req.userId;
        const currUser = User.findById({userId})
        console.log(currUser);
        
    } catch (error) {
        
    }
}
