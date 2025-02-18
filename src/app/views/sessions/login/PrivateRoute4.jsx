import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const PrivateRoute4 = ({ element }) => {
  const location = useLocation();
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

  const isInitiator = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 1] == "1";
  };

  if (roleId === null && userToken) {
    return <div>Loading...</div>;
  }

  return userToken
    ? (isInitiator(roleId) ? element : <Navigate to="/" state={{ redirect: location.pathname + location.search }} replace />)
    : <Navigate to="/" state={{ redirect: location.pathname + location.search }} replace />;
};

export default PrivateRoute4;
