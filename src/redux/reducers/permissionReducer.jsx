export const SET_PERMISSION_DATA = 'SET_PERMISSION_DATA';
export const CLEAR_PERMISSION_DATA = 'CLEAR_PERMISSION_DATA';

const initialPermissionState = JSON.parse(localStorage.getItem('permissionData')) || {};

export const permissionData = (state = initialPermissionState, action) => {
    switch(action.type) {
        case SET_PERMISSION_DATA:
            return {
                ...state,
                ...action.payload
            };
        case CLEAR_PERMISSION_DATA:
            return {};
        default:
            return state;
    }
};
