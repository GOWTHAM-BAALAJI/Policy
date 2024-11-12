export const SET_USER_DATA = 'SET_USER_DATA';

const initialUserState = JSON.parse(sessionStorage.getItem('userData')) || {
    user_id: '',
    emp_id: '',
    emp_name: '',
    emp_email: '',
    emp_password: '',
    emp_mobile: '',
    profile_pic: '',
    role_id: '',
    designation: '',
    cluster_id: '',
    state: '',
    status: '',
    user_group: '',
};

export const userDataReducer = (state = initialUserState, action) => {
    switch(action.type) {
        case SET_USER_DATA:
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
};
