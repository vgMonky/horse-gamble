import { Injectable } from '@angular/core';
import { SessionService } from '@app/services/session-kit.service';
import { Token } from 'src/types';

@Injectable({
    providedIn: 'root'
})
export class TokenBalanceService {
    constructor(private sessionService: SessionService) {}

    async getTokenBalance(client: any, token: Token, account: string): Promise<{ amount: number; token: Token } | undefined> {
        try {
            const result = await client.get_currency_balance(token.account, account, token.symbol);
            console.log(`Balance result for ${token.symbol}:`, result);
    
            // Ensure result is an array
            if (Array.isArray(result) && result.length > 0) {
                const balanceEntry = result[0];
    
                // Extract balance if it's the expected object format
                if (typeof balanceEntry === 'object' && balanceEntry.units?.value?.words?.length > 0) {
                    const rawBalance = balanceEntry.units.value.words[0];
                    console.log(`Extracted raw balance for ${token.symbol}:`, rawBalance);
                    return { amount: rawBalance, token };
                }
    
                console.warn(`Unexpected balance format for ${token.symbol}:`, balanceEntry);
            }
    
            console.log(`No balance found for ${token.symbol}, fallback: 0`);
            return { amount: 0, token };
        } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error);
            return undefined;
        }
    }
}
