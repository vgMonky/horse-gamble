// src/app/core/store/user_preferences/user-preferences.reducer.ts

import { createReducer, on } from '@ngrx/store';
import { actions } from './user.actions';

export interface UserState {
    isDarkTheme: boolean;
    h0: number;
    h1: number;
}

export const initialState: UserState = {
    isDarkTheme: true,
    h0: 170, 
    h1: 215, 
};

export const userReducer = createReducer(
    initialState,
    on(actions.toggleTheme, (state) => ({
        ...state,
        isDarkTheme: !state.isDarkTheme,
    })),
    on(actions.setHue, (state, { h0 }) => ({
        ...state,
        h0,
    })),
    on(actions.setHue1, (state, { h1 }) => ({
        ...state,
        h1,
    }))
);
