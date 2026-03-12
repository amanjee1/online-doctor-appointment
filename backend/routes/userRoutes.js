import { Router } from "express";
import { getProfile, loginUser, registerUser } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";

const userRouter = Router()

userRouter.post('/register',registerUser)

userRouter.post('/login',loginUser)

userRouter.get('/get-profile',authUser,getProfile)

export default userRouter