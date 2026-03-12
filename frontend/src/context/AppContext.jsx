import { createContext, useEffect, useState } from "react";
export const AppContext = createContext();
import axios from 'axios'
import {toast} from 'react-toastify'
const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currencySymbol = '$'
    const [doctors,setDoctors] = useState([])
    const [ token,setToken ] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')

    const getDoctorsData = async () => {
        try {
            
            const {data} = await axios.get(backendUrl+'/api/doctor/list')
            if(data.success){
                setDoctors(data.doctors)
            }
            else{
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    
    const value = {
        doctors,currencySymbol,
        token,setToken,backendUrl
    }

    useEffect(() => {
        getDoctorsData()
    },[])
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider