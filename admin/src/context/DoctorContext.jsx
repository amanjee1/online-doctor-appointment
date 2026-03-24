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

    const doctorAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments',{headers:{dToken}})
            if(data.success){
                setAppointments(data.appointments.reverse())
                console.log(data.appointments.reverse())
            }
            else{
                toast.error(data.error)
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
        doctorAppointments
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider
