// src/app/core/store/user_preferences/user-preferences.reducer.ts

import { createReducer, on } from '@ngrx/store';
import * as UserPreferencesActions from './user-preferences.actions';

export interface UserPreferencesState {
  isDarkTheme: boolean;
  h: number;
  h1: number;
}

export const initialState: UserPreferencesState = {
  isDarkTheme: true,
  h: 170, 
  h1: 215, 
};

export const userPreferencesReducer = createReducer(
  initialState,
  on(UserPreferencesActions.toggleTheme, (state) => ({
    ...state,
    isDarkTheme: !state.isDarkTheme,
  })),
  on(UserPreferencesActions.setHue, (state, { h }) => ({
    ...state,
    h,
  })),
  on(UserPreferencesActions.setHue1, (state, { h1 }) => ({
    ...state,
    h1,
  }))
);
