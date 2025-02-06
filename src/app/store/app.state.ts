// src/app/core/store/app.state.ts

import { ActionReducerMap } from '@ngrx/store';
import { userReducer, UserState } from './user/user.reducer';
import { walletReducer, WalletState } from './wallet/wallet.reducer';
// import { DataState } from './data/data.reducer';
// ... other imports

export interface AppState {
    user: UserState;
    wallet: WalletState;
    // data: DataState;
    // ... other state slices
}

export const AppReducers: ActionReducerMap<AppState> = {
    user: userReducer,
    wallet: walletReducer,
    // data: dataReducer,
    // ... other reducers
};

export const AppEffects = [
    //UserEffects,
    // WalletEffects,
    // DataEffects,
    // ... other effects
];