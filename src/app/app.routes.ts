import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { TradeComponent } from './pages/trade.component';
import { ExploreComponent } from './pages/explore.component';
import { PoolComponent } from './pages/pool.component';

export const routes: Routes = [
  // Navigate to 'home' component by default (empty path)
  { path: '', component: HomeComponent },
  
  { path: 'trade', component: TradeComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'pool', component: PoolComponent },
];
