import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Balance } from 'src/types';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';
import { AccountKitService } from '@app/services/account-kit.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-token-transfer-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './token-transfer-form.component.html',
    styleUrls: ['./token-transfer-form.component.scss']
})
export class TokenTransferFormComponent implements OnInit, OnDestroy {
    @Input() balance!: Balance;

    isLoading = false;
    private destroy$ = new Subject<void>();

    // Recipient input
    recipient: string = '';
    isRecipientValid = false;
    isCheckingRecipient = false;
    isRecipientPatternValid = false;
    isSelfTransfer = false;
    hasTouchedRecipient = false;
    isRecipientDebouncing = false;
    private recipientSubject = new Subject<string>();
    private lastAccountValidationRequest: Promise<void> | null = null;
    private readonly eosioPattern = /^[a-z1-5]{1,12}$/;

    // Amount input
    amount: number | null = null;
    isAmountValid = false;
    hasTouchedAmount = false;
    isAmountDebouncing = false;
    private amountSubject = new Subject<number | null>();

    constructor(
        private tokenBalanceService: TokenBalanceService,
        private sessionService: SessionService,
        private accountKitService: AccountKitService
    ) {}

    ngOnInit(): void {
        this.recipientSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((recipient) => this.validateRecipient(recipient)),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.isRecipientDebouncing = false;
        });

        this.amountSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe((amount) => {
            this.validateAmount(amount);
            this.isAmountDebouncing = false;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get currentSession() {
        return this.sessionService.currentSession;
    }

    onRecipientChange(): void {
        this.clearRecipientValidation();
        this.isRecipientDebouncing = true;
        this.recipientSubject.next(this.recipient);
    }

    private clearRecipientValidation(): void {
        this.isRecipientValid = false;
        this.isRecipientPatternValid = true;
        this.isCheckingRecipient = false;
        this.isSelfTransfer = false;
    }

    async validateRecipient(recipient: string): Promise<void> {
        this.isRecipientPatternValid = this.eosioPattern.test(recipient);
        this.isSelfTransfer = recipient === String(this.currentSession?.actor || '');

        if (!this.isRecipientPatternValid || this.isSelfTransfer) {
            this.isRecipientValid = false;
            this.isCheckingRecipient = false;
            return;
        }

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
        this.clearAmountValidation();
        this.isAmountDebouncing = true;
        this.amountSubject.next(this.amount);
    }

    private clearAmountValidation(): void {
        this.isAmountValid = true;
    }

    private validateAmount(amount: number | null): void {
        if (amount === null) {
            this.isAmountValid = false;
            return;
        }

        const rawBalance = this.balance?.amount.raw ?? 0;
        const precisionFactor = Math.pow(10, this.balance.token.precision);
        const parsedAmount = Math.floor(amount);

        this.isAmountValid = !isNaN(parsedAmount) &&
            parsedAmount > 0 &&
            parsedAmount * precisionFactor <= rawBalance;
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

        this.clearRecipientValidation();
        this.clearAmountValidation();

        this.isRecipientDebouncing = false;
        this.isAmountDebouncing = false;
    }
}
