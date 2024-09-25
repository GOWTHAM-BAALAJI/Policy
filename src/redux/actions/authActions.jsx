import { CLEAR_JWT_TOKEN, SET_JWT_TOKEN } from '../reducers/authReducer';

export const setJwtToken = (token) => (dispatch) => {
    localStorage.setItem('jwtToken', token);
    dispatch({ type: SET_JWT_TOKEN, payload: token });
};

export const clearJwtToken = () => (dispatch) => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userData');
    dispatch({ type: CLEAR_JWT_TOKEN });
};