import React, {useState, useEffect} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const PrivateRoute1 = ({ element }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

    const [roleId, setRoleId] = useState(null);
    const userToken = useSelector((state)=>{
        return state.token;
        });

    useEffect(() => {
        if (userToken) {
          try {
            const decodedToken = jwtDecode(userToken);
            if (decodedToken.role_id) {
              setRoleId(decodedToken.role_id);
            }
          } catch (error) {
            console.error("Error decoding token:", error);
            setRoleId(null);
          }
        }
    }, [userToken]);
    
    return (roleId !== 16 && roleId !== 8) ? element : <Navigate to="/display/list" />;
};

export default PrivateRoute1;
