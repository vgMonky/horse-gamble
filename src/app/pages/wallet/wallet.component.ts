import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';
import { Subscription } from 'rxjs';
import { Balance } from 'src/types';

@Component({
    selector: 'app-wallet',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit, OnDestroy {
    balances: Balance[] = [];
    loading = false;  // Add loading state
    private balanceSubscription!: Subscription;

    constructor(
        private sessionService: SessionService,
        private tokenBalanceService: TokenBalanceService
    ) {}

    get actor(): string | undefined {
        return this.sessionService.currentSession?.actor;
    }

    ngOnInit() {
        this.loading = true;
        this.balanceSubscription = this.tokenBalanceService.getAllBalances().subscribe(balances => {
            this.balances = balances;
            this.loading = false;
        });
    }

    refreshBalances() {
        this.loading = true;
        this.tokenBalanceService.refreshAllBalances();
    }

    ngOnDestroy() {
        if (this.balanceSubscription) this.balanceSubscription.unsubscribe();
    }
}
