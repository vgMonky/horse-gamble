import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Balance } from 'src/types';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';
import { AccountKit } from "@wharfkit/account";
import { APIClient } from "@wharfkit/antelope";
import { Chains } from "@wharfkit/common";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-token-transfer-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './token-transfer-form.component.html',
    styleUrls: ['./token-transfer-form.component.scss']
})
export class TokenTransferFormComponent implements OnInit, OnDestroy {
    @Input() balance!: Balance;
    recipient: string = '';
    amount: number | null = null;
    isLoading: boolean = false;
    isRecipientValid: boolean = false;
    isAmountValid: boolean = false;
    isCheckingRecipient: boolean = false;
    isRecipientPatternValid: boolean = false;
    private accountKit: AccountKit;

    private recipientSubject = new Subject<string>(); // Debounce handling
    private lastAccountValidationRequest: Promise<void> | null = null;

    constructor(
        private tokenBalanceService: TokenBalanceService,
        private sessionService: SessionService
    ) {
        const client = new APIClient({ url: "https://mainnet.telos.net" });
        this.accountKit = new AccountKit(Chains.Telos, { client });
    }

    ngOnInit(): void {
        this.validateInputs();

        // Debounce recipient validation
        this.recipientSubject.pipe(
            debounceTime(500), // Wait 500ms after the last keystroke
            distinctUntilChanged(), // Ignore if value hasn't changed
            switchMap(recipient => this.validateRecipient(recipient))
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.recipientSubject.complete(); // Cleanup
    }

    validateInputs(): void {
        this.validateAmount();
    }

    get currentSession() {
        return this.sessionService.currentSession;
    }

    onRecipientChange(): void {
        this.recipientSubject.next(this.recipient); // Emit input changes
    }

    async validateRecipient(recipient: string): Promise<void> {
        const eosioPattern = /^[a-z1-5]{1,12}$/;
        const currentUser = this.currentSession?.actor;

        this.isRecipientPatternValid = eosioPattern.test(recipient);

        if (!this.isRecipientPatternValid || recipient === currentUser) {
            this.isRecipientValid = false;
            this.isCheckingRecipient = false;
            return;
        }

        this.isCheckingRecipient = true;
        const validationPromise = this.accountKit.load(recipient)
            .then(() => {
                if (this.lastAccountValidationRequest === validationPromise) {
                    this.isRecipientValid = true;
                }
            })
            .catch(() => {
                if (this.lastAccountValidationRequest === validationPromise) {
                    this.isRecipientValid = false;
                }
            })
            .finally(() => {
                if (this.lastAccountValidationRequest === validationPromise) {
                    this.isCheckingRecipient = false;
                }
            });

        this.lastAccountValidationRequest = validationPromise;
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
