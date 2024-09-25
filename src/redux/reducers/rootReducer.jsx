import { combineReducers } from 'redux';
import { tokenReducer } from './authReducer';
import { userDataReducer } from './userReducer';

export const rootReducer = combineReducers({
    token: tokenReducer,
    userData: userDataReducer,
});
