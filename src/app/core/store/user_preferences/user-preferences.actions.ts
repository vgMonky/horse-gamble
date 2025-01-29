// src/app/core/store/user_preferences/user-preferences.actions.ts

import { createAction, props } from '@ngrx/store';

export const toggleTheme = createAction('[User Preferences] Toggle Theme');

export const setHue = createAction(
  '[User Preferences] Set Hue',
  props<{ h: number }>()
);

export const setHue1 = createAction(
  '[User Preferences] Set Hue1',
  props<{ h1: number }>()
);
