import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { SessionService } from '@app/services/session-kit.service';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { TokenListService } from './token-list.service';
import { Token, TransferStatus, TransferSummary } from 'src/types';

@Injectable({
    providedIn: 'root'
})
export class TokenTransferService {
    private transferStatus$ = new BehaviorSubject<Map<string, TransferStatus>>(new Map());

    constructor(
        private sessionService: SessionService,
        private tokenBalanceService: TokenBalanceService,
        private tokenListService: TokenListService
    ) {
        // Subscribe to session$ to detect changes
        this.sessionService.session$.subscribe(session => {
            if (!session) {
                this.resetAllTransfers(); // Clear all transfer statuses on logout
            }
        });
    }

    getTransferStatus$(tokenSymbol: string): Observable<TransferStatus> {
        return this.transferStatus$.asObservable().pipe(
            map(statusMap => statusMap.get(tokenSymbol) || ({ state: 'none' } as TransferStatus))
        );
    }

    resetTransferCycle(tokenSymbol: string): void {
        this.setTransferStatus(tokenSymbol, 'none');
    }

    resetAllTransfers(): void {
        const tokens = this.tokenListService.getTokensValue();
        tokens.forEach(token => {
            this.resetTransferCycle(token.symbol);
        });
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
    }

    async makeTokenTransaction(
        from: string,
        to: string,
        quantity: string,
        contract: string,
        memo: string = '',
        token: Token // Accept the whole Token object instead of just tokenSymbol
    ): Promise<void> {
        console.log(`📤 Initiating token transaction: ${quantity} ${token.symbol} from ${from} to ${to}`);

        const session = this.sessionService.currentSession;
        if (!session) {
            console.error('❌ No active session. Please log in.');
            this.setTransferStatus(token.symbol, 'failure', 'No active session.', null);
            return;
        }

        try {
            const action = {
                account: contract,
                name: 'transfer',
                authorization: [{ actor: from, permission: 'active' }],
                data: { from, to, quantity, memo },
            };

            console.log(`⏳ Sending transaction...`);
            const transactResult = await session.transact({ actions: [action] });

            const txId = transactResult.response?.transaction_id || 'Unknown TX';
            console.log(`✅ Transaction Successful: ${txId}`);

            const summary: TransferSummary = {
                from: session.actor.toString(),
                to,
                amount: quantity,
                transaction: txId,
            };

            console.log(`🟢 Balance refresh requested for ${token.symbol}.`);
            this.setTransferStatus(token.symbol, 'success', `Transferred ${quantity} to ${to}. TX: ${txId.substring(0, 10)}`, summary);

            console.log(`🔄 Waiting for balance update for ${token.symbol}...`);
            this.tokenBalanceService.waitUntilBalanceChanges(token)
                .then(() => console.log(`✅ Balance updated for ${token.symbol}.`))
                .catch(error => console.error(`❌ Error updating balance for ${token.symbol}:`, error));

        } catch (error) {
            console.error('❌ Transaction failed:', error);

            const errorMessage = error instanceof Error ? error.message : 'Transaction failed: Unknown error';

            this.setTransferStatus(token.symbol, 'failure', errorMessage, null);
        }
    }
}

