import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const PrivateRoute3 = ({ element }) => {
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

  const isAdmin = (role_id) => {
    if (role_id === null) return false;
    const temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 4] === "1";
  };

  if (roleId === null && userToken) {
    return <div>Loading...</div>;
  }

  return userToken
    ? (isAdmin(roleId) ? element : <Navigate to="/" />)
    : <Navigate to="/" />;
};

export default PrivateRoute3;
