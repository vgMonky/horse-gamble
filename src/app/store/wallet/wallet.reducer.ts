import { createReducer, on } from '@ngrx/store';
import { actions } from './wallet.actions';

export interface WalletState {
  session: any | null;
  error: string | null;
}

export const initialWalletState: WalletState = {
  session: null,
  error: null,
};

export const walletReducer = createReducer(
  initialWalletState,
  on(actions.loginSuccess, (state, { session }) => ({
    ...state,
    session,
    error: null,
  })),
  on(actions.logout, () => ({
    ...initialWalletState,
  })),
  on(actions.loginFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
