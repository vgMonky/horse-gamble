import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionKit } from '@wharfkit/session';
import { WebRenderer } from '@wharfkit/web-renderer';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private sessionKit: SessionKit;

    // BehaviorSubject to store and emit session changes
    private sessionSubject = new BehaviorSubject<any>(undefined);
    session$: Observable<any> = this.sessionSubject.asObservable();

    constructor() {
        this.sessionKit = new SessionKit({
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
    }

    // Expose current session as a getter
    get currentSession() {
        return this.sessionSubject.value;
    }

    // Login method
    async login() {
        try {
            const { session } = await this.sessionKit.login();
            this.sessionSubject.next(session);  // Emit the new session
            console.log('Login successful:', session);
            return session;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    // Logout method
    async logout() {
        const currentSession = this.sessionSubject.value;
        if (currentSession) {
            await this.sessionKit.logout(currentSession);
            this.sessionSubject.next(undefined);  // Emit session cleared
            console.log('Logout successful');
        }
    }

    // Restore session method
    async restoreSession() {
        const session = await this.sessionKit.restore();
        this.sessionSubject.next(session);  // Emit restored session
        if (session) {
            console.log('Session restored:', session);
        }
        return session;
    }
}
