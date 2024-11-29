import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const PrivateRoute2 = ({ element }) => {
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
        setRoleId(null);
      }
    }
  }, [userToken]);

  return userToken ? ( (roleId !== 16 && roleId !== 8) ? <Navigate to="/dashboard" /> : <Navigate to="/display/list" />) : element;
};

export default PrivateRoute2;
