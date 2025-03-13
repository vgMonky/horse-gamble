import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
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
                    this.updateAllBalances();
                } else {
                    this.balances$.next([]); // Clear balances on logout
                }
            });
    }

    /** Returns the observable balances$ */
    getAllBalances() {
        return this.balances$.asObservable();
    }

    /** Fetches and updates a single token balance */
    async updateSingleBalance(token: Token) {
        try {
            const balance = await this.fetchSingleBalance(token);
            this.addSingleBalanceToState(balance);
        } catch (error) {
            console.error(`❌ Error updating single balance for ${token.symbol}:`, error);
        }
    }

    /** Fetches and updates all token balances */
    async updateAllBalances() {
        try {
            const balances = await this.fetchAllBalances();
            this.addAllBalancesToState(balances);
        } catch (error) {
            console.error(`❌ Error updating all balances:`, error);
        }
    }

    /** Fetches a single token balance from the blockchain */
    private async fetchSingleBalance(token: Token): Promise<Balance> {
        console.log(`📡 Fetching balance for ${token.symbol}...`);

        const session = this.sessionService.currentSession;
        if (!session?.actor) throw new Error("No valid session.");

        const client = session.client.v1.chain;
        if (!client) throw new Error("No valid blockchain client.");

        try {
            const params = {
                json: true,
                code: token.account, // Token contract
                scope: session.actor.toString(), // Account name
                table: "accounts", // EOSIO token table
                limit: 1,
            };

            const result = await client.get_table_rows(params);

            if (!result?.rows?.length) {
                console.warn(`⚠️ No balance found for ${token.symbol}. Returning zero balance.`);
                return { amount: { raw: 0, formatted: this.formatBalance(0, token) }, token };
            }

            console.log(`✅ Raw balance data for ${token.symbol}:`, result.rows[0]);

            // Extract balance
            const balanceEntry = result.rows[0].balance; // Example: "100.0000 TLOS"
            const [amountStr, symbol] = balanceEntry.split(" ");

            if (symbol !== token.symbol) {
                throw new Error(`Mismatch in token symbol. Expected ${token.symbol}, got ${symbol}`);
            }

            const rawAmount = parseFloat(amountStr) * Math.pow(10, token.precision);
            return { amount: { raw: rawAmount, formatted: this.formatBalance(rawAmount, token) }, token };

        } catch (error) {
            console.error(`❌ Error fetching balance for ${token.symbol}:`, error);
            return { amount: { raw: 0, formatted: this.formatBalance(0, token) }, token };
        }
    }

    /** Adds or updates a single balance in balances$ state */
    private addSingleBalanceToState(balance: Balance) {
        const currentBalances = this.balances$.getValue();
        const index = currentBalances.findIndex(b => b.token.symbol === balance.token.symbol);

        if (index !== -1) {
            if (currentBalances[index].amount.raw !== balance.amount.raw) {
                currentBalances[index] = balance;
                this.balances$.next([...currentBalances]); // Trigger UI update
                console.log(`✅ Updated balance for ${balance.token.symbol}: ${balance.amount.formatted}`);
            } else {
                console.log(`⚠️ No change detected in balance for ${balance.token.symbol}.`);
            }
        } else {
            currentBalances.push(balance);
            this.balances$.next([...currentBalances]); // Trigger UI update
            console.log(`✅ Added new balance for ${balance.token.symbol}: ${balance.amount.formatted}`);
        }
    }

    /** Fetches all token balances from blockchain */
    private async fetchAllBalances(): Promise<Balance[]> {
        console.log(`🔄 Fetching all balances...`);

        const session = this.sessionService.currentSession;
        if (!session?.actor) throw new Error("No active session.");

        const client = session.client.v1.chain;
        if (!client) throw new Error("No valid blockchain client.");

        const tokens = this.tokenListService.getTokensValue();
        try {
            const balancePromises = tokens.map(token => this.fetchSingleBalance(token));
            const balances = await Promise.all(balancePromises);

            console.log(`✅ All balances fetched.`);
            return balances;
        } catch (error) {
            console.error(`❌ Error fetching all balances:`, error);
            return [];
        }
    }

    /** Updates the entire balances$ state */
    private addAllBalancesToState(balances: Balance[]) {
        this.balances$.next(balances);
        console.log(`✅ All balances updated in state.`);
    }

    /** Formats a raw balance amount into a readable string */
    private formatBalance(rawAmount: number, token: Token): string {
        const precision = token.precision;
        const factor = Math.pow(10, precision);
        return (rawAmount / factor).toFixed(precision);
    }
}
