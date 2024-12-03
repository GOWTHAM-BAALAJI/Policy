import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const PrivateRoute5 = ({ element }) => {
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

    const isReviewer = (role_id) => {
        let temp = Number(role_id);
        const bin = temp.toString(2);
        return bin[bin.length - 2] == "1";
    };

    const isApprover = (role_id) => {
        let temp = Number(role_id);
        const bin = temp.toString(2);
        return bin[bin.length - 3] == "1";
    };

    if (roleId === null && userToken) {
        return <div>Loading...</div>;
    }

    return userToken
        ? ((!isInitiator(roleId) && !isReviewer(roleId) && !isApprover(roleId)) ? <Navigate to="/" /> : element)
        : <Navigate to="/" />;
};

export default PrivateRoute5;
