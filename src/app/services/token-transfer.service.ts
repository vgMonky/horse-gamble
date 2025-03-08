import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { SessionService } from '@app/services/session-kit.service';
import { TokenBalanceService } from '@app/services/token-balance.service';

@Injectable({
    providedIn: 'root'
})
export class TokenTransferService {
    private transferStatus$ = new BehaviorSubject<Map<string, 'none' | 'success' | 'failure'>>(new Map());

    constructor(
        private sessionService: SessionService,
        private tokenBalanceService: TokenBalanceService
    ) {}

    getTransferStatus(tokenSymbol: string): 'none' | 'success' | 'failure' {
        return this.transferStatus$.getValue().get(tokenSymbol) || 'none';
    }

    getTransferStatus$(tokenSymbol: string) {
        return this.transferStatus$.asObservable().pipe(
            map(statusMap => statusMap.get(tokenSymbol) || 'none')
        );
    }

    setTransferStatus(tokenSymbol: string, status: 'none' | 'success' | 'failure') {
        const statusMap = this.transferStatus$.getValue();
        statusMap.set(tokenSymbol, status);
        this.transferStatus$.next(statusMap);
    }

    async makeTokenTransaction(from: string, to: string, quantity: string, contract: string, memo: string = '', tokenSymbol: string): Promise<void> {
        const session = this.sessionService.currentSession;
        if (!session) {
            console.error('No active session. Please log in.');
            this.setTransferStatus(tokenSymbol, 'failure');
            return;
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

            await session.transact({ actions: [action] });

            this.setTransferStatus(tokenSymbol, 'success');

            // Refresh only the balance for this token
            this.tokenBalanceService.refreshSingleBalance(tokenSymbol);
        } catch (error) {
            console.error('Transaction failed:', error);
            this.setTransferStatus(tokenSymbol, 'failure');
        }
    }
}
