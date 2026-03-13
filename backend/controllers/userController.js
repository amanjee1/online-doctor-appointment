import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import validator from 'validator'
import jwt  from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
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
const updateProfile = async (req,res) => {
    try {
        
        const { name, phone, address, dob, gender } = req.body
        const userId = req.userId
        const imagePath = req.file?.path

        if(!name || !phone || !address || !dob || !gender){
            return res.json({success: false, message: 'Missing data'})
        }

        await userModel.findByIdAndUpdate(
            userId,
            {
                $set : {
                    name,
                    phone,
                    dob,
                    gender,
                    address: JSON.parse(address),
                }
            },
            {
                new : true
            }
        )
        if(imagePath){
            const image = await cloudinary.uploader.upload(imagePath, {
                resource_type: 'auto'
            })
            await userModel.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        image: image.secure_url
                    }
                },
                {
                    new: true
                }
            )
        }
        return res.json({success: true, message: 'Profile Updated'})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

//API to book appointment

const bookAppointment = async (req,res) => {
    try {
        
        const userId = req.userId

        const { slotDate, slotTime, doctorId } = req.body

        const user = await userModel.findById(userId).select("-password")

        const doctor = await doctorModel.findById(doctorId).select("-password")

        if(!doctor.available){
            return res.json({success: false, message: "Doctor not available"})
        }
        
        let slots_booked = doctor.slots_booked

        // checking for slot_availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success: false, message: "Slot not available"})
            }
            else{
                slots_booked[slotDate].push(slotTime)
            }
        }
        else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }
        
        delete doctor.slots_booked

        const amount = doctor.fees
        
        const appointmentData = {
            userId,
            doctorId,
            slotDate,
            slotTime,
            userData : user,
            docData : doctor,
            amount,
            date: Date.now()
        }
        const newAppointment = new appointmentModel(appointmentData)

        await newAppointment.save()

        //save new slots data in doctor
        await doctorModel.findByIdAndUpdate(
            doctorId,
            {
                $set : {
                    slots_booked
                }
            },
            {
                new: true
            }
        )
        return res.json({success: true, message: "Appointment booked"})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

// API to get user appointments

const listAppointment = async (req,res) => {

    try {
        
        const userId = req.userId
        const appointments = await appointmentModel.find({userId})

        res.json({success: true, appointments})

    } catch (error) {
        
    }
}

export { registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment }