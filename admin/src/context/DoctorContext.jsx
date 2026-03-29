import { createContext } from "react";
import AppContextProvider from "./AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useState } from "react";

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const markCompleted = async (appointmentId) => {
        try {
            
            const {data} = await axios.post(backendUrl + '/api/doctor/mark-completed',{appointmentId},{headers: {dToken}});

            if(data.success){
                toast.success(data.message)
                doctorAppointments()
            }
            else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            
            const {data} = await axios.post(backendUrl + '/api/doctor/cancel-appointment',{appointmentId},{headers: {dToken}});

            if(data.success){
                toast.success(data.message)
                doctorAppointments()
            }
            else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const doctorAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments',{headers:{dToken}})
            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
            }
            else{
                toast.error(data.error)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            
            const {data} = await axios.get(backendUrl + '/api/doctor/dashboard',{headers:{dToken}})

            if(data.success){
                setDashData(data.dashData)
                console.log(data.dashData)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {

        try {
            
            const { data } = await axios.get(backendUrl + '/api/doctor/profile',{headers:{dToken}})

            if(data.success){
                setProfileData(data.profileData)
                console.log(data.profileData)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    const value = {
        dToken,
        setDToken,
        appointments,
        setAppointments,
        doctorAppointments,
        markCompleted,
        cancelAppointment,
        getDashData,
        dashData,
        setDashData,
        profileData,
        setProfileData,
        getProfileData,
        backendUrl
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider
