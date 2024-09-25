export const SET_USER_DATA = 'SET_USER_DATA';

const initialUserState = JSON.parse(localStorage.getItem('userData')) || {
    EMPLOYEE_NUMBER: '',
    LEGAL_NAME: '',
    ZONE: '',
    STATE: '',
    REGION: '',
    AREA: '',
    CLUSTER: '',
    BRANCH_CODE: '',
    BRANCH_NAME: '',
    REPORTING_MANAGER: '',
    WORK_EMAILID: '',
    WORK_MOBILE_NUMBER: '',
    emp_designation: '',
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
