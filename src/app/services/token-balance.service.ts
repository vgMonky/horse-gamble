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
        const session = this.sessionService.currentSession;
        if (!session?.actor) return;

        const client = session.client.v1.chain;
        if (!client) return;

        const token = this.tokenListService.getTokensValue().find(t => t.symbol === tokenSymbol);
        if (!token) return;

        const updatedBalance = await this.getTokenBalance(client, token, session.actor);

        if (!updatedBalance) return;

        // Instead of replacing the whole array, update only the changed balance
        const currentBalances = this.balances$.getValue();
        const updatedBalances = currentBalances.map(balance =>
            balance.token.symbol === tokenSymbol ? updatedBalance : balance
        );

        this.balances$.next(updatedBalances); // Emit only modified balances, no full re-render
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

    async makeTokenTransaction(from: string, to: string, quantity: string, contract: string, memo: string = ''): Promise<void> {
        const session = this.sessionService.currentSession;
        if (!session) {
            console.error('No active session. Please log in.');
            throw new Error('No active session.');
        }

        try {
            const action = {
                account: contract,
                name: 'transfer',
                authorization: [{ actor: from, permission: 'active' }],
                data: {
                    from,
                    to,
                    quantity,
                    memo,
                },
            };

            const result = await session.transact({ actions: [action] });
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
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
