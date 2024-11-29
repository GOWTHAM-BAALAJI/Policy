import { SET_USER_DATA } from '../reducers/userReducer';
import { CLEAR_USER_DATA } from '../reducers/userReducer';

export const setUserData = (user) => (dispatch) => {
    localStorage.setItem('userData', JSON.stringify(user));
    dispatch({ type: SET_USER_DATA, payload: user });
};

export const clearUserData = () => (dispatch) => {
    localStorage.removeItem('userData');
    localStorage.clear();
    dispatch({ type: CLEAR_USER_DATA });
};