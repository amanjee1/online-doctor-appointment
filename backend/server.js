import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import { doctorList } from './controllers/doctorController.js'
import userRouter from './routes/userRoutes.js'

//app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()
console.log("CLOUD:", process.env.CLOUDINARY_CLOUD_NAME)
console.log("KEY:", process.env.CLOUDINARY_API_KEY)

//middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/admin',adminRouter)
// localhost:4000/api/admin/add-doctor

app.use('/api/doctor',doctorRouter)
// localhost:4000/api/doctor/list

app.use('/api/user',userRouter)

app.get('/',(req,res)=>{
    res.send('API WORKING')
})
// localhost:4000/api/user/register

app.listen(port, ()=> console.log('Server Started',port))
