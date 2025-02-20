import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Balance } from 'src/types';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';  // 💡 Import SessionService

@Component({
    selector: 'app-token-transfer-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './token-transfer-form.component.html',
    styleUrl: './token-transfer-form.component.scss'
})
export class TokenTransferFormComponent {
    @Input() balance!: Balance;
    recipient: string = '';
    amount: number | null = null;
    isLoading: boolean = false;

    // 💡 Inject SessionService alongside TokenBalanceService
    constructor(
        private tokenBalanceService: TokenBalanceService,
        private sessionService: SessionService
    ) {}

    async transfer(): Promise<void> {
        if (!this.amount || !this.recipient) {
            console.warn('Recipient and amount are required.');
            return;
        }

        const formattedAmount = `${this.amount.toFixed(this.balance.token.precision)} ${this.balance.token.symbol}`;
        const sender = this.sessionService.currentSession?.actor;

        if (!sender) {
            console.error('No active session. Please log in.');
            alert('No active session. Please log in.');
            return;
        }

        try {
            this.isLoading = true;
            console.log(`Transferring ${formattedAmount} from ${sender} to ${this.recipient}`);

            await this.tokenBalanceService.makeTokenTransaction(
                sender,                        // Sender from session
                this.recipient,                // Recipient
                formattedAmount,               // Amount with precision and symbol
                this.balance.token.account,    // Token contract
                `Transfer of ${formattedAmount}` // Memo
            );

            console.log('Transfer successful!');
            alert(`Successfully transferred ${formattedAmount} to ${this.recipient}`);

            // Refresh balances after transfer
            this.tokenBalanceService.refreshAllBalances();

            // Reset form
            this.recipient = '';
            this.amount = null;
        } catch (error) {
            console.error('Transfer failed:', error);
            alert(`Transfer failed: ${error}`);
        } finally {
            this.isLoading = false;
        }
    }
}
