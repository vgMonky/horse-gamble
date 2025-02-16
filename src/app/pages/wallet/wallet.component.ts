import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '@app/services/session-kit.service';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { TokenListService } from '@app/services/token-list.service';
import { Token } from 'src/types';
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
    tokens: Token[] = [];
    balances: { amount: { raw: number; formatted: string }; token: Token }[] = [];
    loading = false;  
    private sessionSubscription!: Subscription;
    private tokenSubscription!: Subscription;

    constructor(
        private sessionService: SessionService,
        private tokenBalanceService: TokenBalanceService,
        private tokenListService: TokenListService
    ) {}

    ngOnInit() {
        this.sessionSubscription = this.sessionService.session$.subscribe(async session => {
            this.actor = session?.actor;
            if (this.actor) {
                this.loadTokenList();
            }
        });
    }

    private loadTokenList() {
        this.tokenSubscription = this.tokenListService.getTokens().subscribe(tokens => {
            this.tokens = tokens;
            if (this.actor) {
                this.loadBalances(this.actor);
            }
        });
    }

    private async loadBalances(account: string) {
        this.loading = true;  
        this.balances = []; 
    
        for (const token of this.tokens) {
            try {
                let balanceData = await this.tokenBalanceService.getTokenBalance(
                    this.sessionService.currentSession?.client.v1.chain, 
                    token, 
                    account,
                    false
                );
                if(balanceData){
                    this.balances.push(balanceData);
                }
            } catch (error) {
                console.error(`Error fetching balance for ${token.symbol}:`, error);
            }
        }
    
        this.loading = false;
    }    

    async refreshBalances() {
        if (this.actor) {
            await this.loadBalances(this.actor);
        }
    }

    ngOnDestroy() {
        if (this.sessionSubscription) this.sessionSubscription.unsubscribe();
        if (this.tokenSubscription) this.tokenSubscription.unsubscribe();
    }
}