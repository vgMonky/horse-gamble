import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '@app/services/session-kit.service';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-wallet',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit, OnDestroy {
    actor: string | undefined;
    balances: { [symbol: string]: string } = {};
    loading = false;  // Track loading state
    private sessionSubscription!: Subscription;

    constructor(
        private sessionService: SessionService,
        private balanceService: TokenBalanceService
    ) {}

    ngOnInit() {
        this.sessionSubscription = this.sessionService.session$.subscribe(async session => {
            this.actor = session?.actor;
            if (this.actor) {
                await this.loadBalances(this.actor);
            } else {
                this.balances = {}; // Clear balances if no session is active
            }
        });
    }

    async loadBalances(account: string) {
        this.loading = true;  // Start loading
        try {
            this.balances = await this.balanceService.getAllBalances(account);
        } catch (error) {
            console.error('Error loading balances:', error);
        } finally {
            this.loading = false;  // Stop loading
        }
    }

    async refreshBalances() {
        if (this.actor) {
            await this.loadBalances(this.actor);
        }
    }

    ngOnDestroy() {
        if (this.sessionSubscription) {
            this.sessionSubscription.unsubscribe();
        }
    }
}
