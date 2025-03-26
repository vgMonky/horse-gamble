import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Session, SessionKit } from '@wharfkit/session';
import { WebRenderer } from '@wharfkit/web-renderer';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';
import { LocalStorageService } from './local-storage.service';
@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private sessionKit: SessionKit;
    private localStorageService = inject(LocalStorageService);


    // BehaviorSubject to store and emit session changes
    private sessionSubject = new BehaviorSubject<Session | undefined>(undefined);
    session$: Observable<Session | undefined> = this.sessionSubject.asObservable();

    constructor(
        private router: Router // inject the Router
    ) {
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

            const actor = session?.actor;
            this.localStorageService.restoreUserPreferences(actor.toString());

            this.router.navigate(['/wallet']);

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
        }
        this.localStorageService.restoreUserPreferences(null);
    }

    // Restore session method
    async restoreSession() {
        const session = await this.sessionKit.restore();
        this.sessionSubject.next(session);  // Emit restored session
        if (session) {
        }
        const actor = session?.actor || null;
        if (actor) {
            this.localStorageService.restoreUserPreferences(actor.toString());
        } else {
            this.localStorageService.restoreUserPreferences(null);
        }
        return session;
    }
}
