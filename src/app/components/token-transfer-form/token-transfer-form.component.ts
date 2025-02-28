import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Balance } from 'src/types';
import { TokenBalanceService } from '@app/services/token-balance.service';
import { SessionService } from '@app/services/session-kit.service';
import { AccountKitService } from '@app/services/account-kit.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AbstractControl } from '@angular/forms';
import { timer, of, catchError, map, switchMap } from 'rxjs';

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
                [this.accountValidator()]  // With debounce built-in!
            ],
            amount: [
                null,
                [Validators.required, this.amountValidator()]
            ]
        });

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
            if (control.value === sessionActor) {
                return { selfTransfer: true };
            }
            return null;
        };
    }

    accountValidator() {
        return (control: AbstractControl) => {
            if (!control.value) {
                return of(null); // Important: Must return an observable, not a promise!
            }

            return timer(300).pipe( // Apply debounce directly inside the validator
                switchMap(() => this.accountKitService.validateAccount(control.value)),
                map(exists => exists ? null : { accountNotFound: true }),
                catchError(() => of({ accountNotFound: true })) // Network error = treat as not found
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

        const numericAmount = parseFloat(amount);  // Convert string to number
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Invalid amount entered');
            return;
        }

        const formattedAmount = `${numericAmount.toFixed(this.balance.token.precision)} ${this.balance.token.symbol}`;
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
