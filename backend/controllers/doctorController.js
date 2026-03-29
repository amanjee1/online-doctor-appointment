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

// API to mark appointment compleated

const markAppointmentCompleted = async (req,res) => {
    try {
        const docId = req.id
        const { appointmentId } = req.body
        console.log(appointmentId)
        const appointmentData = await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.doctorId == docId){
            await appointmentModel.findByIdAndUpdate(
                appointmentId,
                {
                    $set: {
                        isCompleted: true
                    }
                },
                {
                    new: true
                }
            )
            return res.json({success: true, message: "Appointment compleated"})
        }
        res.json({success: false, message: 'Mark Failed'})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// API to cancel appointment

const cancelAppointment = async (req,res) => {
    try {

        const docId = req.id
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.doctorId == docId){
            await appointmentModel.findByIdAndUpdate(
                appointmentId,
                {
                    $set: {
                        cancelled: true
                    }
                },
                {
                    new : true
                }
            )

            const { slotDate, slotTime } = appointmentData 
            const doctorData = await doctorModel.findById(docId);

            let slots_booked = doctorData.slots_booked

            slots_booked[slotDate] = slots_booked[slotDate].filter((item) => item != slotTime)

            await doctorModel.findByIdAndUpdate(
                docId,
                {
                    $set : {
                        slots_booked
                    }
                },
                {
                    new : true
                }
            )

            return res.json({success: true, message: 'Appointment Cancelled'})
        }
        res.json({success: false, message: 'Cancellation Failed'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// API to get dashboard data for doctor panel

const doctorDashboard = async (req,res) => {
    try {
        
        const docId = req.id
        const appointments = await appointmentModel.find({doctorId: docId})

        let earnings = 0;
        appointments.map((item) => {
            if(item.isCompleted || item.payment){
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success: true, dashData})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// API to get doctor profile for doctor panel

const doctorProfile = async (req,res) => {

    try {
       
        const docId = req.id
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({success : true, profileData})


    } catch (error) {
        res.json({success: false, message: error.message})
    }

}

// API to updata doctor profile data from doctor Panel

const updateDoctorProfile = async (req,res) => {

    try {
        
        const docId = req.id
        const { fees,address,available } = req.body

        await doctorModel.findByIdAndUpdate(
            docId,
            {
                $set: {
                    fees,
                    address,
                    available
                }
            },
            {
                new : true
            }
        )

        res.json({success: true, message: 'Profile Updated'})

    } catch (error) {
        res.json({success: false, message: error.message})
    }

}

export { changeAvailability,doctorList,doctorLogin,getDoctorAppointments,markAppointmentCompleted,cancelAppointment,doctorDashboard,doctorProfile,updateDoctorProfile }