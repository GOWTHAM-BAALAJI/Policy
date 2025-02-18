import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const PrivateRoute2 = ({ element }) => {
  const userToken = useSelector((state) => state.token);
  const [roleId, setRoleId] = useState(null);
  const location = useLocation();

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

  if (roleId === null && userToken) {
    return <div>Loading...</div>;
  }

  return userToken
    ? (roleId !== 16 && roleId !== 8
      ? <Navigate to="/dashboard" />
      : <Navigate to="/display/list" />)
    : element;
};

export default PrivateRoute2;
