// src/app/core/store/user_/user-.selectors.ts

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

const selectUserState = createFeatureSelector<UserState>('user');

const isDarkTheme = createSelector(
    selectUserState,
    (state: UserState) => state.isDarkTheme
);

const hue = createSelector(
    selectUserState,
    (state: UserState) => state.h
);

const hue1 = createSelector(
    selectUserState,
    (state: UserState) => state.h1
);

export const selectors = {
    isDarkTheme,
    hue,
    hue1,
};
