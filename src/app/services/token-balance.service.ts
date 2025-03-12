import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SessionService } from '@app/services/session-kit.service';
import { TokenListService } from '@app/services/token-list.service';
import { Token, Balance } from 'src/types';
import { ChainAPI } from '@wharfkit/session';

@Injectable({
    providedIn: 'root'
})
export class TokenBalanceService {
    private balances$ = new BehaviorSubject<Balance[]>([]);

    constructor(
        private sessionService: SessionService,
        private tokenListService: TokenListService
    ) {
        combineLatest([this.sessionService.session$, this.tokenListService.getTokens()])
            .subscribe(([session, tokens]) => {
                if (session?.actor) {
                    this.fetchAllBalances(tokens, session.actor);
                } else {
                    this.balances$.next([]); // Clear balances on logout
                }
            });
    }

    private async fetchAllBalances(tokens: Token[], account: string) {
        const client = this.sessionService.currentSession?.client.v1.chain;
        if (!client || !account) {
            this.balances$.next([]);
            return;
        }

        try {
            const balancePromises = tokens.map(token =>
                this.getTokenBalance(client, token, account).then(balance => balance || null)
            );

            const balances = (await Promise.all(balancePromises)).filter(b => b !== null) as Balance[];
            this.balances$.next(balances);
        } catch (error) {
            console.error('Error fetching all balances:', error);
            this.balances$.next([]); // Reset on failure
        }
    }

    getAllBalances() {
        return this.balances$.asObservable();
    }

    refreshAllBalances() {
        const session = this.sessionService.currentSession;
        if (session?.actor) {
            this.fetchAllBalances(this.tokenListService.getTokensValue(), session.actor);
        }
    }

    async refreshSingleBalance(tokenSymbol: string) {
        console.log(`🔄 refreshSingleBalance called for: ${tokenSymbol}`);

        const session = this.sessionService.currentSession;
        if (!session?.actor) {
            console.warn('⚠️ No valid session or actor found.');
            return;
        }
        console.log(`👤 Session actor: ${session.actor.toString()}`);

        const client = session.client.v1.chain;
        if (!client) {
            console.warn('⚠️ No valid client found.');
            return;
        }

        const token = this.tokenListService.getTokensValue().find(t => t.symbol === tokenSymbol);
        if (!token) {
            console.warn(`⚠️ Token not found in token list: ${tokenSymbol}`);
            return;
        }
        console.log(`💰 Token found: ${JSON.stringify(token)}`);

        // Get current balance before updating
        const currentBalances = this.balances$.getValue();
        const currentBalance = currentBalances.find(b => b.token.symbol === tokenSymbol);
        if (currentBalance) {
            console.log(`📌 Current balance before update: ${currentBalance.amount.formatted} ${tokenSymbol}`);
        } else {
            console.log(`📌 No existing balance found for ${tokenSymbol}, assuming zero.`);
        }

        console.log('🔍 Fetching updated balance...');
        const updatedBalance = await this.getTokenBalance(client, token, session.actor);

        if (!updatedBalance) {
            console.warn(`⚠️ Failed to fetch balance for ${tokenSymbol}`);
            return;
        }
        console.log(`✅ Updated balance fetched: ${updatedBalance.amount.formatted} ${tokenSymbol}`);

        // Compare and log if there's an actual change
        if (currentBalance?.amount.raw === updatedBalance.amount.raw) {
            console.log(`⚠️ No balance change detected for ${tokenSymbol}.`);
            return;
        } else {
            console.log(`🔄 Balance change detected! ${currentBalance?.amount.formatted || '0.0000'} → ${updatedBalance.amount.formatted} ${tokenSymbol}`);
        }

        // Update only the modified balance
        const updatedBalances = currentBalances.map(balance =>
            balance.token.symbol === tokenSymbol ? updatedBalance : balance
        );

        this.balances$.next(updatedBalances);
        console.log(`✅ Balance updated successfully for ${tokenSymbol}`);
    }


    async getTokenBalance(client: ChainAPI, token: Token, account: string, get_zero_balance: boolean = true): Promise<Balance | undefined> {
        try {
            const result = await client.get_currency_balance(token.account, account, token.symbol);

            let rawAmount = 0;
            if (Array.isArray(result) && result.length > 0) {
                const balanceEntry = result[0];

                if (typeof balanceEntry === 'object' && balanceEntry.units?.value?.words?.length > 0) {
                    rawAmount = balanceEntry.units.value.words[0];
                } else {
                    console.warn(`Unexpected balance format for ${token.symbol}:`, balanceEntry);
                }
            }

            const formattedAmount = this.formatBalance(rawAmount, token);
            let balanceData: Balance = { amount: { raw: rawAmount, formatted: formattedAmount }, token };

            // filter out if zero unless it's TLOS
            if (!get_zero_balance){
                return this.isValid(balanceData) ? balanceData : undefined;
            } else {
                return balanceData;
            }

        } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error);
            return undefined;
        }
    }

    formatBalance(rawAmount: number, token: Token): string {
        const precision = token.precision;
        const factor = Math.pow(10, precision);
        return (rawAmount / factor).toFixed(precision);
    }

    isValid(balance: { amount: { raw: number }; token: Token }): boolean {
        return balance.token.symbol === 'TLOS' || balance.amount.raw > 0;
    }
}
