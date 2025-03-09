import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { SessionService } from '@app/services/session-kit.service';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { TransferStatus, TransferSummary } from 'src/types';

@Injectable({
    providedIn: 'root'
})
export class TokenTransferService {
    private transferStatus$ = new BehaviorSubject<Map<string, TransferStatus>>(new Map());

    constructor(
        private sessionService: SessionService,
        private tokenBalanceService: TokenBalanceService
    ) {}

    getTransferStatus$(tokenSymbol: string) {
        return this.transferStatus$.asObservable().pipe(
            map(statusMap => statusMap.get(tokenSymbol) || ({ state: 'none' } as TransferStatus))
        );
    }

    resetTransferCycle(tokenSymbol: string): void {
        this.setTransferStatus(tokenSymbol, 'none');
    }

    setTransferStatus(
        tokenSymbol: string,
        state: 'none' | 'success' | 'failure',
        message?: string,
        summary: TransferSummary | null = null
    ) {
        const statusMap = this.transferStatus$.getValue();
        statusMap.set(tokenSymbol, { state, message, summary });
        this.transferStatus$.next(statusMap);
        this.logStatus(tokenSymbol);
    }

    async makeTokenTransaction(
        from: string,
        to: string,
        quantity: string,
        contract: string,
        memo: string = '',
        tokenSymbol: string
    ): Promise<void> {
        const session = this.sessionService.currentSession;
        if (!session) {
            console.error('No active session. Please log in.');
            this.setTransferStatus(tokenSymbol, 'failure', 'No active session. Please log in.', null);
            return;
        }

        try {
            const action = {
                account: contract,
                name: 'transfer',
                authorization: [{ actor: from, permission: 'active' }],
                data: { from, to, quantity, memo },
            };
            const transactResult = await session.transact({ actions: [action] });

            const txId = transactResult.response?.transaction_id || 'Unknown TX';
            const sessionActor = session.actor.toString();

            await this.tokenBalanceService.refreshSingleBalance(tokenSymbol);

            const summary: TransferSummary = {
                from: sessionActor,
                to,
                amount: quantity,
                transaction: txId
            };

            this.setTransferStatus(tokenSymbol, 'success', `Transferred ${quantity} to ${to}. TX: ${txId.substring(0, 10)}`, summary);
        } catch (error) {
            console.error('Transaction failed:', error);

            const errorMessage = error instanceof Error ? error.message : 'Transaction failed: Unknown error';

            this.setTransferStatus(tokenSymbol, 'failure', errorMessage, null);
        }
    }

    private logStatus(tokenSymbol: string): void {
        const status = this.transferStatus$.getValue().get(tokenSymbol) || { state: 'none' };
        console.log(`[TokenTransferService] Status for ${tokenSymbol}:`, status);
    }
}

