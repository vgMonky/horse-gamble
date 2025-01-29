// src/app/core/store/app.state.ts

import { UserPreferencesState } from './user_preferences/user-preferences.reducer';
// Import additional state interfaces here as you create them
// import { WalletInfoState } from './wallet_info/wallet-info.reducer';
// import { DataFetchState } from './data_fetch/data-fetch.reducer';
// ... other imports

export interface AppState {
  userPreferences: UserPreferencesState;
  // walletInfo: WalletInfoState;
  // dataFetch: DataFetchState;
  // ... other state slices
}
