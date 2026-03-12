import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import validator from 'validator'
import jwt  from 'jsonwebtoken'
//API to register user
const registerUser = async (req,res) => {
    try {
        
        const { email, name, password } = req.body

        if(!email || !name || !password){
            return res.json({success: false, message: 'Required all fields'})
        }
        
        if(!validator.isEmail(email)){
            return res.json({success: false, message: "Invalid email"})
        }

        if(password.length < 8){
            return res.json({success: false, message: "Weak password"})
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }
        
        const newUser = new userModel(userData)

        const user = await newUser.save()

        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET
        )

        return res.json({success: true, token})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

//API for user login

const loginUser = async (req,res) => {
    try {

        const { email, password } = req.body
        
        if(!email || !password){
            return res.json({success: false, message: "Missing credentials"})
        }

        const user = await userModel.findOne(
            {email}
        )

        if(!user){
            return res.json({success: false, message: "User does not exist"})
        }

        const isPasswordValid = await bcrypt.compare(password,user.password)
        
        if(isPasswordValid){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            return res.json({success: true, token})
        }
        else{
            return res.json({success: false, message: "Invalid credentials"})
        }
        
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

//API to get user profile data
const getProfile = async (req,res) => {
    try {

        const userId = req.userId
        
        const userData = await userModel.findById(userId).select("-password")

        res.json({success: true, userData})
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

// API to update user Profile

export { registerUser,loginUser,getProfile }