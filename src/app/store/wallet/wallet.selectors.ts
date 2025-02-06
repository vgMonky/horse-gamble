import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletState } from './wallet.reducer';

const selectWalletState = createFeatureSelector<WalletState>('wallet');

const selectSession = createSelector(
  selectWalletState,
  (state: WalletState) => state.session
);

const selectError = createSelector(
  selectWalletState,
  (state: WalletState) => state.error
);

export const selectors = {
  selectSession,
  selectError,
};
