import { Routes } from '@angular/router';
import { HomeComponent } from '@app/pages/home/home.component';
import { OngoingComponent } from '@app/pages/races/ongoing/ongoing.component';
import { UpcomingComponent } from '@app/pages/races/upcoming/upcoming.component';
import { CompletedComponent } from '@app/pages/races/completed/completed.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { PreferencesComponent } from './pages/preferences/preferences.component';
import { AccountsComponent } from './pages/accounts/accounts.component';

export const routes: Routes = [
    // Navigate to 'home' component by default (empty path)
    { path: '', component: HomeComponent },

    { path: 'upcoming', component: UpcomingComponent },
    { path: 'ongoing', component: OngoingComponent },
    { path: 'completed', component: CompletedComponent },
    { path: 'wallet', component: WalletComponent },
    { path: 'preferences', component: PreferencesComponent},
    { path: 'accounts', component: AccountsComponent},
];
