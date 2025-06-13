import { Routes } from '@angular/router';
import { HomeComponent } from '@app/pages/home/home.component';
import { RacesComponent } from '@app/pages/races/races/races.component';
import { BetsComponent } from '@app/pages/races/bets/bets.component';
import { CompletedComponent } from '@app/pages/races/completed/completed.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { PreferencesComponent } from './pages/preferences/preferences.component';
import { AccountsComponent } from './pages/accounts/accounts.component';

export const routes: Routes = [
    // Navigate to 'home' component by default (empty path)
    { path: '', component: HomeComponent },

    { path: 'races', component: RacesComponent },
    { path: 'completed', component: CompletedComponent },
    { path: 'bets', component: BetsComponent },
    { path: 'wallet', component: WalletComponent },
    { path: 'preferences', component: PreferencesComponent},
    { path: 'accounts', component: AccountsComponent},
];
