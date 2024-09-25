import { SET_USER_DATA } from '../reducers/userReducer';

export const setUserData = (user) => (dispatch) => {
    localStorage.setItem('userData', JSON.stringify(user));
    dispatch({ type: SET_USER_DATA, payload: user });
};
