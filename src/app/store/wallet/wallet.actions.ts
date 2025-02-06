import { createAction, props } from '@ngrx/store';

const loginSuccess = createAction(
  '[Wallet] Login Success',
  props<{ session: any }>()
);

const logout = createAction(
  '[Wallet] Logout'
);

const loginFailure = createAction(
  '[Wallet] Login Failure',
  props<{ error: string }>()
);

export const actions = {
  loginSuccess,
  logout,
  loginFailure,
};
