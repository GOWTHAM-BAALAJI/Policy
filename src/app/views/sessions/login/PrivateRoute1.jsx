import React, {useState, useEffect} from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const PrivateRoute1 = ({ element }) => {
    const [roleId, setRoleId] = useState(null);

    const userToken = useSelector((state)=>{
        return state.token;//.data;
        });
    console.log("UserToken:",userToken);    

    useEffect(() => {
        if (userToken) {
          try {
            const decodedToken = jwtDecode(userToken);
            if (decodedToken.role_id) {
              setRoleId(decodedToken.role_id);
            }
          } catch (error) {
            console.error("Error decoding token:", error);
            setRoleId(null); // Reset roleId if decoding fails
          }
        }
    }, [userToken]);
    
    return roleId !== 4 ? element : <Navigate to="/display/list" />;
};

export default PrivateRoute1;
