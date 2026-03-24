//API for adding doctor

import validator from "validator";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // checking for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for loginAdmin

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.json({
        success: false,
        message: "Invalid credentials ",
      });
    }

    const token = jwt.sign(email + password, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list

const appointmentsAdmin = async (req,res) => {
  try {
    const appointments = await appointmentModel.find({})

    res.json({success: true, appointments})
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message });
  }
}

const appointmentCancel = async (req,res) => {

    try {

        const { appointmentId } = req.body
        
        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate
        (
            appointmentId,
            {
                $set: {
                    cancelled: true
                }
            },
            {
                new: true
            }
        )

        const {doctorId, slotDate, slotTime} = appointmentData

        const doctorData = await doctorModel.findById(doctorId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter((item) => item !== slotTime)

        await doctorModel.findByIdAndUpdate(
            doctorId,
            {
                $set: {
                    slots_booked 
                }
            },
            {
                new: true
            }
        )
        return res.json({success: true, message: "Appointment cancelled"})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }

}

// API to get dashboard data

const adminDashboard = async (req,res) => {
  try {
    
    const doctors = await doctorModel.find({})
    const users = await userModel.find({})

    const appointments = await appointmentModel.find({})

      const dashData = {
        doctors: doctors.length,
        appointments: appointments.length,
        patients: users.length,
        latestAppointments: appointments.reverse().slice(0,5)
      }

      res.json({success:true,dashData})
  } catch (error) {
    console.log(error)
    return res.json({success: false, message: error.message})
  }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel,adminDashboard };
