// src/app/core/store/user_preferences/user-preferences.selectors.ts

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserPreferencesState } from './user-preferences.reducer';

export const selectUserPreferencesState = createFeatureSelector<UserPreferencesState>('userPreferences');

export const selectIsDarkTheme = createSelector(
  selectUserPreferencesState,
  (state: UserPreferencesState) => state.isDarkTheme
);

export const selectHue = createSelector(
  selectUserPreferencesState,
  (state: UserPreferencesState) => state.h
);

export const selectHue1 = createSelector(
  selectUserPreferencesState,
  (state: UserPreferencesState) => state.h1
);
