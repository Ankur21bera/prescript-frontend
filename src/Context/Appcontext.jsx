import { createContext } from "react";
import { doctors } from "../assets/assets";
import { useState } from "react";
export const AppContext = createContext();

const AppContextProvider = (props) => {

    const [token,setToken] = useState([]);

    const value = {
      
       token,
       setToken
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider