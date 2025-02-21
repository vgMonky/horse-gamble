import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Balance } from 'src/types';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';

@Component({
    selector: 'app-token-transfer-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './token-transfer-form.component.html',
    styleUrl: './token-transfer-form.component.scss'
})
export class TokenTransferFormComponent implements OnInit {
    @Input() balance!: Balance;
    recipient: string = '';
    amount: number | null = null;
    isLoading: boolean = false;
    isRecipientValid: boolean = false;
    isAmountValid: boolean = false;

    constructor(
        private tokenBalanceService: TokenBalanceService,
        private sessionService: SessionService
    ) {}

    ngOnInit(): void {
        this.validateInputs();
    }

    validateRecipient(): void {
        const eosioPattern = /^[a-z1-5]{1,12}$/;
        this.isRecipientValid = eosioPattern.test(this.recipient);
    }

    validateAmount(): void {
        const rawBalance = this.balance?.amount.raw ?? 0;

        // Ensure the input is a valid positive whole number
        const parsedAmount = this.amount !== null ? Math.floor(Number(this.amount)) : 0;

        // Validate: Must be a positive integer and within balance
        this.isAmountValid =
            !isNaN(parsedAmount) &&
            parsedAmount > 0 &&
            parsedAmount * Math.pow(10, this.balance.token.precision) <= rawBalance;
    }

    validateInputs(): void {
        this.validateRecipient();
        this.validateAmount();
    }

    async transfer(): Promise<void> {
        if (!this.isRecipientValid || !this.isAmountValid) return;

        const formattedAmount = `${this.amount!.toFixed(this.balance.token.precision)} ${this.balance.token.symbol}`;
        const sender = this.sessionService.currentSession?.actor;

        if (!sender) {
            alert('No active session. Please log in.');
            return;
        }

        try {
            this.isLoading = true;
            console.log(`Transferring ${formattedAmount} from ${sender} to ${this.recipient}`);

            await this.tokenBalanceService.makeTokenTransaction(
                sender,
                this.recipient,
                formattedAmount,
                this.balance.token.account,
                `Transfer of ${formattedAmount}`
            );

            alert(`Successfully transferred ${formattedAmount} to ${this.recipient}`);
            this.tokenBalanceService.refreshAllBalances();

            this.recipient = '';
            this.amount = null;
            this.validateInputs();
        } catch (error) {
            console.error('Transfer failed:', error);
            alert(`Transfer failed: ${error}`);
        } finally {
            this.isLoading = false;
        }
    }
}
