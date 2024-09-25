import {clearJwtToken} from './actions/authActions';

let idleTimeout;

export const startIdleTimer = (dispatch, timeout = 15 * 60 * 1000) => {
    clearTimeout(idleTimeout);

    idleTimeout = setTimeout(() => {
        dispatch(clearJwtToken());  
        window.location.href = '/'; 
    }, timeout);
};

export const resetIdleTimer = () => {
    clearTimeout(idleTimeout);
};

export const setupActivityListeners = (dispatch) => {
    const resetIdleTimerWithDispatch = () => startIdleTimer(dispatch);

    window.addEventListener('mousemove', resetIdleTimerWithDispatch);
    window.addEventListener('keydown', resetIdleTimerWithDispatch);
    window.addEventListener('mousedown', resetIdleTimerWithDispatch);
    window.addEventListener('touchstart', resetIdleTimerWithDispatch);
    window.addEventListener('click', resetIdleTimerWithDispatch);
    startIdleTimer(dispatch);
};

export const clearActivityListeners = () => {
    window.removeEventListener('mousemove', resetIdleTimer);
    window.removeEventListener('keydown', resetIdleTimer);
    window.removeEventListener('mousedown', resetIdleTimer);
    window.removeEventListener('touchstart', resetIdleTimer);
    window.removeEventListener('click', resetIdleTimer);
};
