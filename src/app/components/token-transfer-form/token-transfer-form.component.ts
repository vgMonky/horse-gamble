import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Balance } from 'src/types';

@Component({
    selector: 'app-token-transfer-form',
    standalone: true,
    imports: [CommonModule, FormsModule], // Add FormsModule here
    templateUrl: './token-transfer-form.component.html',
    styleUrl: './token-transfer-form.component.scss'
})
export class TokenTransferFormComponent {
    @Input() balance!: Balance;

    recipient: string = '';
    amount: number | null = null;

    transfer(): void {
        console.log(`Transferring ${this.amount} ${this.balance.token.symbol} to ${this.recipient}`);
    }
}
