import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";
import { useUserGroup } from 'app/contexts/UserGroupContext';

const PrivateRoute6 = ({ element }) => {
    const userToken = useSelector((state) => state.token);
    const [fetchedUserGroup, setFetchedUserGroup] = useState(null);
    useEffect(() => {
    if (userToken) {
        try {
        const decodedToken = jwtDecode(userToken);
        if (decodedToken.user_group) {
            setFetchedUserGroup(decodedToken.user_group);
        }
        } catch (error) {
        console.error("Error decoding token:", error);
        setFetchedUserGroup(null);
        }
    }
    }, [userToken]);
    const navigate = useNavigate();
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    const { userGroup } = useUserGroup();

    if (!userToken) {
        return <Navigate to="/login" />;
    } else{

        return element;
    }
};

export default PrivateRoute6;
