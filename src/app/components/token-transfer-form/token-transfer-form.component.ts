import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Balance } from 'src/types';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';
import { AccountKitService } from '@app/services/account-kit.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-token-transfer-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './token-transfer-form.component.html',
    styleUrls: ['./token-transfer-form.component.scss']
})
export class TokenTransferFormComponent implements OnInit, OnDestroy {
    @Input() balance!: Balance;

    // Form Fields
    recipient: string = '';
    amount: number | null = null;

    // State Management
    isLoading = false;
    private recipientSubject = new Subject<string>();
    private lastAccountValidationRequest: Promise<void> | null = null;
    private subscription!: Subscription;

    // Validation States
    isRecipientValid = false;
    isAmountValid = false;
    isCheckingRecipient = false;
    isRecipientPatternValid = false;
    isSelfTransfer = false;

    // EOSIO username pattern (1-12 chars, a-z, 1-5)
    private readonly eosioPattern = /^[a-z1-5]{1,12}$/;

    constructor(
        private tokenBalanceService: TokenBalanceService,
        private sessionService: SessionService,
        private accountKitService: AccountKitService // Injected service
    ) {}

    ngOnInit(): void {
        this.subscription = this.recipientSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            switchMap((recipient) => this.validateRecipient(recipient))
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.recipientSubject.complete();
        this.subscription.unsubscribe();
    }

    get currentSession() {
        return this.sessionService.currentSession;
    }

    onRecipientChange(): void {
        this.recipientSubject.next(this.recipient);
    }

    async validateRecipient(recipient: string): Promise<void> {
        const currentUser = String(this.currentSession?.actor || '');

        this.isRecipientPatternValid = this.eosioPattern.test(recipient);
        this.isSelfTransfer = recipient === currentUser;

        if (!this.isRecipientPatternValid || this.isSelfTransfer) {
            this.isRecipientValid = false;
            this.isCheckingRecipient = false;
            return;
        }

        // Validate existence of recipient's account via service
        this.isCheckingRecipient = true;
        const validationPromise = this.accountKitService.validateAccount(recipient)
            .then((exists) => {
                if (this.lastAccountValidationRequest === validationPromise) {
                    this.isRecipientValid = exists;
                }
            })
            .finally(() => {
                if (this.lastAccountValidationRequest === validationPromise) {
                    this.isCheckingRecipient = false;
                }
            });

        this.lastAccountValidationRequest = validationPromise;
    }

    onAmountChange(): void {
        const rawBalance = this.balance?.amount.raw ?? 0;
        const parsedAmount = this.amount !== null ? Math.floor(Number(this.amount)) : 0;

        this.isAmountValid =
            !isNaN(parsedAmount) &&
            parsedAmount > 0 &&
            parsedAmount * Math.pow(10, this.balance.token.precision) <= rawBalance;
    }

    async transfer(): Promise<void> {
        if (!this.isRecipientValid || !this.isAmountValid) return;

        const formattedAmount = `${this.amount!.toFixed(this.balance.token.precision)} ${this.balance.token.symbol}`;
        const sender = this.currentSession?.actor;

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
            this.resetForm();
        } catch (error) {
            console.error('Transfer failed:', error);
            alert(`Transfer failed: ${error}`);
        } finally {
            this.isLoading = false;
        }
    }

    private resetForm(): void {
        this.recipient = '';
        this.amount = null;
        this.isRecipientValid = false;
        this.isAmountValid = false;
        this.isSelfTransfer = false;
    }
}
