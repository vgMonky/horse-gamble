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
    @Input() tokenSymbol!: string;

    balance!: Balance | null;
    form!: FormGroup;
    isLoading = false;
    private destroy$ = new Subject<void>();
    viewState: 'form' | 'success' | 'failure' = 'form';

    constructor(
        private fb: FormBuilder,
        private tokenBalanceService: TokenBalanceService,
        private sessionService: SessionService,
        private accountKitService: AccountKitService
    ) {}

    ngOnInit(): void {
        // Init Form
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
                [Validators.required, this.amountValidator()]
            ]
        });

        // Suscribe to balances$
        this.tokenBalanceService.getAllBalances()
        .pipe(
            takeUntil(this.destroy$),
            map(balances => balances.find(b => b.token.symbol === this.tokenSymbol)),
            distinctUntilChanged() // Only trigger updates when the balance changes
        )
        .subscribe(balance => {
            this.balance = balance || null;
            if (this.balance) {
                this.form.get('amount')?.updateValueAndValidity(); // Ensure validators run again
            }
        });

        // handle decimal precision
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
                return of(null);
            }

            return timer(300).pipe(
                switchMap(() => this.accountKitService.validateAccount(control.value)),
                map(exists => exists ? null : { accountNotFound: true }),
                catchError(() => of({ accountNotFound: true }))
            );
        };
    }


    // ===============================================
    // Amount Methods

    amountValidator() {
        return (control: any) => {
            if (!this.balance || !this.balance.token) return { invalidAmount: true };

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
        if (value === null || value === undefined || !this.balance) return; // Ensure balance exists

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

    useMax(): void {
        if (!this.balance) return;
        const maxAmount = this.balance.amount.formatted;
        this.form.get('amount')?.setValue(maxAmount);
    }
    isMaxAmount(): boolean {
        return this.balance ? this.form.get('amount')?.value === this.balance.amount.formatted : false;
    }

    // ================================================
    // Transfer Logic

    async transfer(): Promise<void> {
        if (this.form.invalid) return;

        const { recipient, amount } = this.form.value;

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Invalid amount entered');
            return;
        }

        if (!this.balance) {
            alert('Balance not available yet. Please wait and try again.');
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
            this.tokenBalanceService.refreshSingleBalance(this.tokenSymbol);
            this.viewState = 'success';
        } catch (error) {
            console.error('Transfer failed:', error);
            this.viewState = 'failure';
        } finally {
            this.isLoading = false;
        }
    }
}
