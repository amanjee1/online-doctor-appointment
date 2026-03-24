import { Router } from "express";
import { doctorList, doctorLogin, getDoctorAppointments } from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = Router()

doctorRouter.get('/list',doctorList)

doctorRouter.post('/login', doctorLogin)

doctorRouter.get('/appointments',authDoctor,getDoctorAppointments)

export default doctorRouter