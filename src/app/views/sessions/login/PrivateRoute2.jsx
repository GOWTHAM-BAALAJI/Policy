import React, {useState, useEffect} from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ element }) => {
    const userToken = useSelector((state) => state.token);
    const [roleId, setRoleId] = useState(null);
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

    return userToken ? <Navigate to="/dashboard" /> : element ;
};

export default PrivateRoute;
