import { Injectable } from '@angular/core';
import { SessionService } from '@app/services/session-kit.service';
import { Token } from 'src/types';

@Injectable({
    providedIn: 'root'
})
export class TokenBalanceService {
    constructor(private sessionService: SessionService) {}

    async getTokenBalance(client: any, token: Token, account: string): Promise<{ amount: { raw: number; formatted: string }; token: Token } | undefined> {
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
            return { amount: { raw: rawAmount, formatted: formattedAmount }, token };
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
}
