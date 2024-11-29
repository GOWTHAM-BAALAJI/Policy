import { CLEAR_JWT_TOKEN, SET_JWT_TOKEN } from '../reducers/authReducer';

export const setJwtToken = (token) => (dispatch) => {
    localStorage.setItem('jwtToken', token);
    sessionStorage.setItem('jwtToken', token);
    dispatch({ type: SET_JWT_TOKEN, payload: token });
};

export const clearJwtToken = () => (dispatch) => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('tokenExpiry');
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('tokenExpiry');
    sessionStorage.clear();
    localStorage.clear();
    dispatch({ type: CLEAR_JWT_TOKEN });
};