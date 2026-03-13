import { Router } from "express";
import { bookAppointment, getProfile, listAppointment, loginUser, registerUser, updateProfile } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { upload } from "../middlewares/multer.js";

const userRouter = Router()

userRouter.post('/register',registerUser)

userRouter.post('/login',loginUser)

userRouter.get('/get-profile',authUser,getProfile)

userRouter.post('/update-profile',upload.single('image'), authUser ,updateProfile)

userRouter.post('/book-appointment',authUser,bookAppointment)

userRouter.get('/api/user/appointments',authUser,listAppointment)

export default userRouter