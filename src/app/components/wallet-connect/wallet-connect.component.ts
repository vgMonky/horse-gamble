import { Component } from '@angular/core';
import { SessionKit } from '@wharfkit/session';
import { WebRenderer } from '@wharfkit/web-renderer';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-wallet-connect',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './wallet-connect.component.html',
    styleUrls: ['./wallet-connect.component.scss'],
})
export class WalletConnectComponent {
    session: any = undefined;  // Store the session once the user logs in
    isUserOpen = false;

    // Initialize the session kit with app details, network, and wallet plugin
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
            new WalletPluginCleos()
        ],
    });

    // Handle login and create a session
    async login() {
        try {
            const { session } = await this.sessionKit.login();
            this.session = session;
            console.log('Login successful:', session);
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    // Handle logout
    async logout() {
        await this.sessionKit.logout(this.session);
        this.session = undefined;
        console.log('Logout successful');
    }

    // Restore session on component load
    async ngOnInit() {
        this.session = await this.sessionKit.restore();
        if (this.session) {
            console.log('Session restored:', this.session);
        }
    }

    toggleUserDropdown() {this.isUserOpen = !this.isUserOpen;}
    closeUserDropdown() {this.isUserOpen = false;}
}


