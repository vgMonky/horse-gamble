import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Balance } from 'src/types';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';
import { AccountKitService } from '@app/services/account-kit.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-token-transfer-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './token-transfer-form.component.html',
    styleUrls: ['./token-transfer-form.component.scss']
})
export class TokenTransferFormComponent implements OnInit, OnDestroy {
    @Input() balance!: Balance;

    form!: FormGroup;
    isLoading = false;
    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private tokenBalanceService: TokenBalanceService,
        private sessionService: SessionService,
        private accountKitService: AccountKitService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            recipient: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^[a-z1-5]{1,12}$/),
                    this.selfTransferValidator()
                ],
                [this.accountValidator()]
            ],
            amount: [
                null,
                [
                    Validators.required,
                    Validators.min(1),
                    this.amountValidator()
                ]
            ]
        });

        this.form.get('recipient')?.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe();

        this.form.get('amount')?.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(value => {
            this.enforceDecimalPrecision(value);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ================================================
    // Recipient Methods

    selfTransferValidator() {
        return (control: any) => {
            const sessionActor = this.sessionService.currentSession?.actor?.toString();
            const isSelf = control.value === sessionActor;
            if (isSelf) {
                return { selfTransfer: true };
            }
            return null;
        };
    }


    accountValidator(): AsyncValidatorFn {
        return (control) => {
            return this.accountKitService.validateAccount(control.value).then(exists =>
                exists ? null : { accountNotFound: true }
            );
        };
    }

    // ===============================================
    // Amount Methods

    amountValidator() {
        return (control: any) => {
            if (!this.balance) return null;

            const amount = parseFloat(control.value);
            if (isNaN(amount) || amount <= 0) return { invalidAmount: true };

            const precisionFactor = Math.pow(10, this.balance.token.precision);
            const rawBalance = this.balance.amount.raw;

            if (amount * precisionFactor > rawBalance) {
                return { outOfBalance: true };
            }

            return null;
        };
    }

    private enforceDecimalPrecision(value: any): void {
        if (value === null || value === undefined) return;

        const precision = this.balance.token.precision;

        let stringValue = value.toString();

        if (stringValue.includes('.')) {
            let [integerPart, decimalPart] = stringValue.split('.');

            // Trim only if it's longer than precision
            if (decimalPart.length > precision) {
                decimalPart = decimalPart.slice(0, precision);
            }

            stringValue = `${integerPart}.${decimalPart}`;
        }

        this.form.get('amount')?.setValue(stringValue, { emitEvent: false });
    }

    // ================================================
    // Transfer Logic

    async transfer(): Promise<void> {
        if (this.form.invalid) return;

        const { recipient, amount } = this.form.value;
        const formattedAmount = `${amount.toFixed(this.balance.token.precision)} ${this.balance.token.symbol}`;
        const sender = this.sessionService.currentSession?.actor;

        if (!sender) {
            alert('No active session. Please log in.');
            return;
        }

        try {
            this.isLoading = true;
            await this.tokenBalanceService.makeTokenTransaction(
                sender,
                recipient,
                formattedAmount,
                this.balance.token.account,
                `Transfer of ${formattedAmount}`
            );
            alert(`Successfully transferred ${formattedAmount} to ${recipient}`);
            this.tokenBalanceService.refreshAllBalances();
            this.form.reset();
        } catch (error) {
            console.error('Transfer failed:', error);
            alert(`Transfer failed: ${error}`);
        } finally {
            this.isLoading = false;
        }
    }
}
