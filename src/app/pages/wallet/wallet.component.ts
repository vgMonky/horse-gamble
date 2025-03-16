import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';
import { Subscription } from 'rxjs';
import { Balance } from 'src/types';
import { ExpandableComponent } from '@app/components/base-components/expandable/expandable.component';
import { ExpandableGroupComponent } from '@app/components/base-components/expandable/expandable-group.component';
import { TokenTransferFormComponent } from '@app/components/token-transfer-form/token-transfer-form.component';

@Component({
    selector: 'app-wallet',
    standalone: true,
    imports: [
        CommonModule,
        ExpandableComponent,
        ExpandableGroupComponent,
        TokenTransferFormComponent,
    ],
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit, OnDestroy {
    balances: Balance[] = [];
    loading = false;
    private balanceSubscription!: Subscription;

    constructor(
        private sessionService: SessionService,
        private tokenBalanceService: TokenBalanceService,
        private tokenTransferService: TokenTransferService,
    ) {}

    get actor(): string | undefined {
        return this.sessionService.currentSession?.actor;
    }

    ngOnInit() {
        this.balanceSubscription = this.tokenBalanceService.getAllBalances().subscribe(balances => {
            this.balances = balances;
            this.loading = false;
        });
    }

    refreshBalances() {
        this.loading = true;
        this.tokenBalanceService.updateAllBalances();
    }

    ngOnDestroy() {
        if (this.balanceSubscription) this.balanceSubscription.unsubscribe();
    }
}
