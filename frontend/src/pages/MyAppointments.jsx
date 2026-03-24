import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import { toast } from 'react-toastify'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [ appointments,setAppointments ] = useState([])
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
  }

  const getUsersAppointments = async () => {
    try {
      
      const { data } = await axios.get(backendUrl+'/api/user/appointments',{headers:{ token }})
      if(data.success){
        setAppointments(data.appointments) // now newer appointments will be stored first in appointments array
        console.log(data.appointments)
      }
      else{
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {

    try {
      
      const {data} = await axios.post(
        backendUrl+'/api/user/cancel-appointment',
        {
          appointmentId
        }
        ,{headers:{token}}
      )
      if(data.success){
        toast.success(data.message)
        getUsersAppointments()
        getDoctorsData()
      }
      else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(token){
      getUsersAppointments()
    }
  },[token])

  const appointmentRazorPay = async (appointmentId) => {
    try {
      const { data } = axios.post(backendUrl + '/api/user/payment-razorpay',{appointmentId},{headers:{token}})

      if(data.success){
        console.log(data.order)
        // 11:50:00 do it 
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <div>
      <p className='pb-3 mt-12 border-b font-medium text-zinc-700'>My appointments</p>
      <div>
        {
          appointments.map((item,index) => (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div>
                <img className='w-32 bg-indigo-50'src={item.docData.image} alt="" />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='text-xs mt-1'><span className='text-sm font-medium text-neutral-700'>Date & Time: </span>{slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              </div>

              <div></div>

              <div className='flex flex-col gap-2 justify-end'>
                {!item.cancelled && <button onClick = {() => appointmentRazorPay(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                {!item.cancelled && <button onClick={() => cancelAppointment(item._id)}  className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}

                {
                  item.cancelled && 
                  <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>
                }
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default MyAppointments