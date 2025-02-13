// src/app/core/store/user_preferences/user-preferences.actions.ts

import { createAction, props } from '@ngrx/store';

const toggleTheme = createAction('[User Preferences] Toggle Theme');

const setHue = createAction(
    '[User Preferences] Set Hue',
    props<{ h0: number }>()
);

const setHue1 = createAction(
    '[User Preferences] Set Hue1',
    props<{ h1: number }>()
);

export const actions = {
    toggleTheme,
    setHue,
    setHue1,
};