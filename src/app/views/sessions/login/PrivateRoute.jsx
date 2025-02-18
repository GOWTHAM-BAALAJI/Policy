import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ element }) => {
    const location = useLocation();
    const token = useSelector((state) => state.token);
    return token ? element : <Navigate to="/" state={{ redirect: location.pathname + location.search }} replace />;
};

export default PrivateRoute;
