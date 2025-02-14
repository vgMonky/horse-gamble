import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@app/services/session-kit.service';
import { Token } from 'src/types';

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
                balances[token.symbol] = this.formatBalance(0, token);
            }
        }
        console.log('Raw balances:', balances);

        const filteredBalances = this.filter_zero_balance(balances);
        return filteredBalances;
    }

    // ✅ Function to filter out tokens with zero balance, keeping TLOS always
    private filter_zero_balance(balances: { [symbol: string]: string }): { [symbol: string]: string } {
        const filteredBalances: { [symbol: string]: string } = {};

        for (const [symbol, balance] of Object.entries(balances)) {
            const numericBalance = parseFloat(balance.split(' ')[0]); // Extract numeric part

            if (symbol === 'TLOS' || numericBalance > 0) {
                filteredBalances[symbol] = balance;
            }
        }

        return filteredBalances;
    }

    // Fetch balance for a single token
    private async getBalance(client: any, token: Token, account: string): Promise<string> {
        try {
            const result = await client.get_currency_balance(token.account, account, token.symbol);
            console.log(result)
            // Check if result is an array with at least one item
            if (Array.isArray(result) && result.length > 0) {
                const balanceEntry = result[0];
    
                // If it's a string, return as-is
                if (typeof balanceEntry === 'string') {
                    return balanceEntry;
                }
    
                // If it's an object, extract numeric value (adjust this based on actual API response structure)
                if (typeof balanceEntry === 'object' && balanceEntry.value) {
                    const balance = balanceEntry.value.toString(); // Convert to string safely
                    return this.formatBalance(balance, token);
                }
            }
    
            return this.formatBalance(0, token); // Default to zero balance
        } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error);
            return this.formatBalance(0, token);
        }
    }
    
    

    // Format balance using token precision
    private formatBalance(amount: number | string, token: Token): string {
        const precision = token.precision;
        return `${Number(amount).toFixed(precision)} ${token.symbol}`;
    }
}
