import { Routes } from '@angular/router';
import { HomeComponent } from '@app/pages/home/home.component';
import { TradeComponent } from '@app/pages/trade/trade.component';
import { ExploreComponent } from '@app/pages/explore/explore.component';
import { PoolComponent } from '@app/pages/pool/pool.component';
import { WalletComponent } from './pages/wallet/wallet.component';

export const routes: Routes = [
    // Navigate to 'home' component by default (empty path)
    { path: '', component: HomeComponent },

    { path: 'trade', component: TradeComponent },
    { path: 'explore', component: ExploreComponent },
    { path: 'pool', component: PoolComponent },
    { path: 'wallet', component: WalletComponent },
];
