import { createContext } from "react";
import AppContextProvider from "./AppContext";

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
    const value = {

    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider
