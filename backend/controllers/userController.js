import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import validator from 'validator'
import jwt  from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
import { GoogleGenerativeAI } from '@google/generative-ai'

//API to register user
const registerUser = async (req,res) => {
    try {
        
        const { email, name, password } = req.body

        if(!email || !name || !password){
            return res.json({success: false, message: 'Required all fields'})
        }
        
        if(!validator.isEmail(email)){
            return res.json({success: false, message: "Invalid email"})
        }

        if(password.length < 8){
            return res.json({success: false, message: "Weak password"})
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }
        
        const newUser = new userModel(userData)

        const user = await newUser.save()

        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET
        )

        return res.json({success: true, token})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

//API for user login

const loginUser = async (req,res) => {
    try {

        const { email, password } = req.body
        
        if(!email || !password){
            return res.json({success: false, message: "Missing credentials"})
        }

        const user = await userModel.findOne(
            {email}
        )

        if(!user){
            return res.json({success: false, message: "User does not exist"})
        }

        const isPasswordValid = await bcrypt.compare(password,user.password)
        
        if(isPasswordValid){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            return res.json({success: true, token})
        }
        else{
            return res.json({success: false, message: "Invalid credentials"})
        }
        
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

//API to get user profile data
const getProfile = async (req,res) => {
    try {

        const userId = req.userId
        
        const userData = await userModel.findById(userId).select("-password")

        res.json({success: true, userData})
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

// API to update user Profile
const updateProfile = async (req,res) => {
    try {
        
        const { name, phone, address, dob, gender } = req.body
        const userId = req.userId
        const imagePath = req.file?.path

        if(!name || !phone || !address || !dob || !gender){
            return res.json({success: false, message: 'Missing data'})
        }

        await userModel.findByIdAndUpdate(
            userId,
            {
                $set : {
                    name,
                    phone,
                    dob,
                    gender,
                    address: JSON.parse(address),
                }
            },
            {
                new : true
            }
        )
        if(imagePath){
            const image = await cloudinary.uploader.upload(imagePath, {
                resource_type: 'auto'
            })
            await userModel.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        image: image.secure_url
                    }
                },
                {
                    new: true
                }
            )
        }
        return res.json({success: true, message: 'Profile Updated'})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

//API to book appointment

const bookAppointment = async (req,res) => {
    try {
        
        const userId = req.userId

        const { slotDate, slotTime, doctorId } = req.body

        const user = await userModel.findById(userId).select("-password")

        const doctor = await doctorModel.findById(doctorId).select("-password")

        if(!doctor.available){
            return res.json({success: false, message: "Doctor not available"})
        }
        
        let slots_booked = doctor.slots_booked

        // checking for slot_availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success: false, message: "Slot not available"})
            }
            else{
                slots_booked[slotDate].push(slotTime)
            }
        }
        else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }
        
        delete doctor.slots_booked

        const amount = doctor.fees
        
        const appointmentData = {
            userId,
            doctorId,
            slotDate,
            slotTime,
            userData : user,
            docData : doctor,
            amount,
            date: Date.now()
        }
        const newAppointment = new appointmentModel(appointmentData)

        await newAppointment.save()

        //save new slots data in doctor
        await doctorModel.findByIdAndUpdate(
            doctorId,
            {
                $set : {
                    slots_booked
                }
            },
            {
                new: true
            }
        )
        return res.json({success: true, message: "Appointment booked"})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

// API to get user appointments

const listAppointment = async (req,res) => {

    try {
        
        const userId = req.userId
        const appointments = await (await appointmentModel.find({ userId })).reverse()

        res.json({success: true, appointments})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

// API to cancel an appointment

const cancelAppointment = async (req,res) => {

    try {
        
        const userId = req.userId
        const { appointmentId } = req.body
        
        const appointmentData = await appointmentModel.findById(appointmentId)

        if(appointmentData.userId !== userId){
            res.json({success: false, message: 'Unauthorized action'})
        }

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

const razorpayInstance = new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})

// API to make payment of appointment using razorpay

const paymentRazorpay = async (req,res) => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if(!appointmentData || appointmentData.cancelled){
            return res.json({success: false, message:"Appointment cancelled or not found"})
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100, 
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({success: true, order})
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req,res) => {
    try {
        
        const {razorpay_order_id} = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if(orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment : true})
            res.json({success:true, message: "Payment Successful"})
        }
        else {
            res.json({success:false, message: "Payment failed"})
        }

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

const uploadReport = async (req, res) => {
  try {
    const userId = req.userId

    const { title, type } = req.body

    const file = req.file

    if (!file) {
      return res.json({ success: false, message: 'No file uploaded' })
    }

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
    })

    await userModel.findByIdAndUpdate(userId, {
      $push: {
        reports: {
          title,
          type,
          fileUrl: result.secure_url
        }
      }
    })

    res.json({
      success: true,
      message: 'Report uploaded successfully'
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const rateDoctor = async (req, res) => {
  try {
    const userId = req.userId
    const { appointmentId, doctorId, rating } = req.body

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    if (!appointment.isCompleted) {
      return res.json({
        success: false,
        message: 'You can only rate completed appointments'
      })
    }

    if (appointment.isRated) {
      return res.json({
        success: false,
        message: 'Doctor already rated for this appointment'
      })
    }

    const doctor = await doctorModel.findById(doctorId)

    const total = doctor.rating * doctor.numberOfRatings
    const newNumberOfRatings = doctor.numberOfRatings + 1
    const newRating = (total + rating) / newNumberOfRatings

    await doctorModel.findByIdAndUpdate(doctorId, {
      rating: Number(newRating.toFixed(1)),
      numberOfRatings: newNumberOfRatings
    })

    appointment.isRated = true
    appointment.patientRating = rating
    await appointment.save()

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to analyze symptoms and recommend a doctor specialty using AI
const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body

    if (!symptoms || symptoms.trim().length === 0) {
      return res.json({ success: false, message: 'Please describe your symptoms' })
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ GEMINI_API_KEY is not set')
      return res.json({ 
        success: false, 
        message: 'AI service not configured. Please use the specialty menu instead.' 
      })
    }

    console.log('Analyzing symptoms:', symptoms.substring(0, 50) + '...')

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Available specialties in our system
    const availableSpecialties = [
      'General physician',
      'Gynecologist',
      'Dermatologist',
      'Pediatricians',
      'Neurologist',
      'Gastroenterologist'
    ]

    const prompt = `You are a medical assistant. A patient has described their symptoms. Based on the symptoms, recommend which specialist they should consult.

Available specialists: ${availableSpecialties.join(', ')}

Patient's symptoms: "${symptoms}"

Respond ONLY with a JSON object in this format (no other text):
{
  "recommendedSpecialty": "one of the available specialists",
  "confidence": 85,
  "reasoning": "brief explanation of why this specialist"
}

IMPORTANT: 
- Only recommend from the available specialists list
- Confidence should be 0-100
- Always return valid JSON`

    try {
      console.log('Sending to Gemini API...')
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      console.log('Raw response:', responseText)

      // Parse the JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }

      const analysis = JSON.parse(jsonMatch[0])

      // Validate the recommended specialty
      if (!availableSpecialties.includes(analysis.recommendedSpecialty)) {
        analysis.recommendedSpecialty = 'General physician' // Fallback
      }

      console.log('Analysis complete:', analysis)
      
      res.json({
        success: true,
        recommendedSpecialty: analysis.recommendedSpecialty,
        confidence: analysis.confidence || 75,
        reasoning: analysis.reasoning || 'Based on your symptoms, this specialist can help'
      })
    } catch (parseError) {
      console.log('Parse error:', parseError.message)
      // Fallback to General physician
      res.json({
        success: true,
        recommendedSpecialty: 'General physician',
        confidence: 60,
        reasoning: 'Our AI system recommends starting with a general physician who can then refer you to a specialist if needed.'
      })
    }

  } catch (error) {
    console.log('Symptom analysis error:', error.message)
    res.json({ 
      success: false, 
      message: 'Could not analyze symptoms. Please try again or use the specialty menu.' 
    })
  }
}

export { registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,paymentRazorpay, verifyRazorpay, uploadReport,rateDoctor,analyzeSymptoms }