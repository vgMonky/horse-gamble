import { Routes } from '@angular/router';
import { HomeComponent } from '@app/core/pages/home.component';
import { TradeComponent } from '@app/core/pages/trade.component';
import { ExploreComponent } from '@app/core/pages/explore.component';
import { PoolComponent } from '@app/core/pages/pool.component';

export const routes: Routes =  [
  // Navigate to 'home' component by default (empty path)
  { path: '', component: HomeComponent },
  
  { path: 'trade', component: TradeComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'pool', component: PoolComponent },
];
