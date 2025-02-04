// src/app/core/store/user_preferences/user-preferences.reducer.ts

import { createReducer, on } from '@ngrx/store';
import { actions } from './user.actions';

export interface UserState {
    isDarkTheme: boolean;
    h: number;
    h1: number;
}

export const initialState: UserState = {
    isDarkTheme: true,
    h: 170, 
    h1: 215, 
};

export const userReducer = createReducer(
    initialState,
    on(actions.toggleTheme, (state) => ({
        ...state,
        isDarkTheme: !state.isDarkTheme,
    })),
    on(actions.setHue, (state, { h }) => ({
        ...state,
        h,
    })),
    on(actions.setHue1, (state, { h1 }) => ({
        ...state,
        h1,
    }))
);
