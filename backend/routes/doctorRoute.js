import { Router } from "express";
import { cancelAppointment, doctorDashboard, doctorList, doctorLogin, doctorProfile, getDoctorAppointments, markAppointmentCompleted, updateDoctorProfile } from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = Router()

doctorRouter.get('/list',doctorList)

doctorRouter.post('/login', doctorLogin)

doctorRouter.get('/appointments',authDoctor,getDoctorAppointments)

doctorRouter.post('/mark-completed',authDoctor,markAppointmentCompleted)

doctorRouter.post('/cancel-appointment',authDoctor,cancelAppointment)

doctorRouter.get('/dashboard',authDoctor,doctorDashboard)

doctorRouter.get('/profile',authDoctor,doctorProfile)

doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile)

export default doctorRouter