import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, firstValueFrom } from 'rxjs';
import { SessionService } from '@app/services/session-kit.service';
import { TokenListService } from '@app/services/token-list.service';
import { Token, Balance } from 'src/types';

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

    async getTokenBalance(client: any, token: Token, account: string, get_zero_balance: boolean = false): Promise<Balance | undefined> {
        try {
            const result = await client.get_currency_balance(token.account, account, token.symbol);
            console.log(`Balance result for ${token.symbol}:`, result);

            let rawAmount = 0;
            if (Array.isArray(result) && result.length > 0) {
                const balanceEntry = result[0];

                if (typeof balanceEntry === 'object' && balanceEntry.units?.value?.words?.length > 0) {
                    rawAmount = balanceEntry.units.value.words[0];
                    console.log(`Extracted raw balance for ${token.symbol}:`, rawAmount);
                } else {
                    console.warn(`Unexpected balance format for ${token.symbol}:`, balanceEntry);
                }
            } else {
                console.log(`No balance found for ${token.symbol}, fallback: 0`);
            }

            const formattedAmount = this.formatBalance(rawAmount, token);
            let balanceData: Balance = { amount: { raw: rawAmount, formatted: formattedAmount }, token };

            // filter out if zero unles its TLOS
            if (!get_zero_balance){
                return this.isValid(balanceData) ? balanceData : undefined;
            } else {
                return balanceData;
            }

            return balanceData

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
