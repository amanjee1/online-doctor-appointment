import { Router } from "express";
import {
  bookAppointment,
  cancelAppointment,
  getProfile,
  listAppointment,
  loginUser,
  paymentRazorpar,
  registerUser,
  updateProfile,
  uploadReport,
  rateDoctor,
  analyzeSymptoms
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { upload } from "../middlewares/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUser);

userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getProfile);

userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile,
);

userRouter.post(
  "/upload-report",
  authUser,
  upload.single("report"),
  uploadReport,
);

userRouter.post("/book-appointment", authUser, bookAppointment);

userRouter.get("/appointments", authUser, listAppointment);

userRouter.post("/cancel-appointment", authUser, cancelAppointment);

userRouter.post("/payment-razorpay", authUser, paymentRazorpar);

userRouter.post('/rate-doctor', authUser, rateDoctor)

userRouter.post('/analyze-symptoms', authUser, analyzeSymptoms)

export default userRouter;
