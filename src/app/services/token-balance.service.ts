import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@app/services/session-kit.service';

interface Token {
    name: string;
    symbol: string;
    account: string;
    precision: number;
    logo: string;
    chain: string;
}

@Injectable({
    providedIn: 'root'
})
export class TokenBalanceService {
    private tokens: Token[] = [];

    constructor(
        private sessionService: SessionService,
        private http: HttpClient
    ) {
        this.loadTokenList();
    }

    // Load token list from JSON file
    private loadTokenList() {
        this.http.get<Token[]>('assets/tokens_mainnet.json').subscribe({
            next: tokens => (this.tokens = tokens),
            error: err => console.error('Error loading token list:', err)
        });
    }

    // Fetch all token balances for the current account
    async getAllBalances(account: string): Promise<{ [symbol: string]: string }> {
        const session = this.sessionService.currentSession;
        if (!session) {
            throw new Error('No active session. Please log in first.');
        }

        const balances: { [symbol: string]: string } = {};

        for (const token of this.tokens) {
            try {
                const balance = await this.getBalance(session.client.v1.chain, token, account);
                balances[token.symbol] = balance;
            } catch (error) {
                console.error(`Error fetching balance for ${token.symbol}:`, error);
                balances[token.symbol] = `0.0000 ${token.symbol}`;
            }
        }

        // Filter out tokens with 0 balances, except for TLOS
        const filteredBalances: { [symbol: string]: string } = {};
        for (const [symbol, balance] of Object.entries(balances)) {
            const balanceString = String(balance);  // Convert balance to string safely
            if (symbol === 'TLOS' || !balanceString.startsWith('0.0000')) {
                filteredBalances[symbol] = balanceString;
            }
        }

        return filteredBalances;
    }

    // Fetch balance for a single token
    private async getBalance(client: any, token: Token, account: string): Promise<string> {
        const result = await client.get_currency_balance(
            token.account,
            account,
            token.symbol
        );

        return result.length > 0 ? result[0] : `0.0000 ${token.symbol}`;
    }
}
