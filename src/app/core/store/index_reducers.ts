// src/app/core/store/index_reducers.ts

import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.state';
import { userPreferencesReducer } from './user_preferences/user-preferences.reducer';
// Import additional reducers here as you create them
// import { walletInfoReducer } from './wallet_info/wallet-info.reducer';
// import { dataFetchReducer } from './data_fetch/data-fetch.reducer';
// ... other imports

export const reducers: ActionReducerMap<AppState> = {
  userPreferences: userPreferencesReducer,
  // walletInfo: walletInfoReducer,
  // dataFetch: dataFetchReducer,
  // ... other reducers
};
