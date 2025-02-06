import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state'; // adjust the import path as needed
import { wallet } from '@app/store/wallet'; // this imports your wallet module
import { SessionKit } from '@wharfkit/session';
import { WebRenderer } from '@wharfkit/web-renderer';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wallet-connect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss'],
})
export class WalletConnectComponent implements OnInit {
  session$: Observable<any>;

  sessionKit = new SessionKit({
    appName: 'session-connect',
    chains: [
      {
        id: '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11',
        url: 'https://mainnet.telos.net',
      },
    ],
    ui: new WebRenderer(),
    walletPlugins: [
      new WalletPluginAnchor(),
      new WalletPluginCleos(),
    ],
  });

  constructor(private store: Store<AppState>) {
    // Initialize session$ here using the store that is now available.
    this.session$ = this.store.select(wallet.selectors.selectSession);
  }

  // Handle login and dispatch the global wallet login action
  async login() {
    try {
      const { session } = await this.sessionKit.login();
      this.store.dispatch(wallet.actions.loginSuccess({ session }));
      console.log('Login successful:', session);
    } catch (error: any) {
      console.error('Login failed:', error);
      this.store.dispatch(wallet.actions.loginFailure({ error: error.message || 'Login failed' }));
    }
  }

  // Handle logout and dispatch the global wallet logout action
  async logout() {
    try {
      await this.sessionKit.logout();
      this.store.dispatch(wallet.actions.logout());
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  }

  // Restore session on component load and update the global store if found
  async ngOnInit() {
    try {
      const session = await this.sessionKit.restore();
      if (session) {
        this.store.dispatch(wallet.actions.loginSuccess({ session }));
        console.log('Session restored:', session);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  }
}
