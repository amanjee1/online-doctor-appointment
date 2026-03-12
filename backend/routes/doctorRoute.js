import { Router } from "express";
import { doctorList } from "../controllers/doctorController.js";

const doctorRouter = Router()

doctorRouter.get('/list',doctorList)

export default doctorRouter