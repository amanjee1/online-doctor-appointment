import { Router } from 'express'
import { addDoctor,allDoctors,loginAdmin,appointmentsAdmin, adminDashboard } from '../controllers/adminController.js'
import {upload} from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailability } from '../controllers/doctorController.js'
import { appointmentCancel } from '../controllers/adminController.js'

const adminRouter = Router()

adminRouter.post('/add-doctor',authAdmin ,upload.single('image'), addDoctor)

adminRouter.post('/login',loginAdmin)

adminRouter.post('/all-doctors',authAdmin,allDoctors)

adminRouter.post('/change-availability',authAdmin,changeAvailability)

adminRouter.get('/appointments',authAdmin, appointmentsAdmin)

adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)

adminRouter.get('/dashboard',authAdmin,adminDashboard)

export default adminRouter