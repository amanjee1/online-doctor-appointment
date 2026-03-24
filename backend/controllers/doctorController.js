import doctorModel from "../models/doctorModel.js"
import validator from "validator";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";


const changeAvailability = async (req,res) => {
    try {   
        
        const {docId} = req.body
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{ available: !docData.available })
        res.json({success: true, message: "Availability Changed"})

    } catch (error) {
        console.log(error)
        res.json({success : false, message: error.message})
    }
}

const  doctorList = async (req,res) => {
    try {

        const doctors = await doctorModel.find({}).select(['-password -email'])
        res.json({success: true, doctors})
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// API for doctor Login 

const doctorLogin = async (req,res) => {

    try {
       
        const {email, password} = req.body
        
        if(!email || !password){
            res.json({success: false, message: 'All fields are required'})
        }
        
        const doctor = await doctorModel.findOne({email})
        
        if(!doctor){
            return res.json({success: true, message: 'Invalid credentials'})
        }
        const isPasswordCorrect = await bcrypt.compare(password,doctor.password)

        if(!isPasswordCorrect){
            return res.json({success: true, message: 'Incorrect Password'})
        }

        const dToken = jwt.sign({id: doctor._id}, process.env.JWT_SECRET)
        
        res.json({success: true, dToken})

    } catch (error) {
        res.json({success: false, message: error.message})
    }

}

// API to get all appointment of a doctor

const getDoctorAppointments = async (req,res) => {
    try {
        
        const docId = req.id
        const appointments = await appointmentModel.find({ doctorId: docId })

        res.json({success: true, appointments})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
export { changeAvailability,doctorList,doctorLogin,getDoctorAppointments }