export const SET_JWT_TOKEN = 'SET_JWT_TOKEN';
export const CLEAR_JWT_TOKEN = 'CLEAR_JWT_TOKEN';

const initialTokenState = localStorage.getItem('jwtToken') || '';

export const tokenReducer = (state = initialTokenState, action) => {
    switch(action.type) {
        case SET_JWT_TOKEN:
            return action.payload;
        case CLEAR_JWT_TOKEN:
            return '';
        default:
            return state;
    }
};
