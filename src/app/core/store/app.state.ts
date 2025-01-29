// src/app/core/store/app.state.ts

import { UserPreferencesState } from './user_preferences/user-preferences.reducer';

export interface AppState {
  userPreferences: UserPreferencesState;
  // Add other state slices here as needed
}
