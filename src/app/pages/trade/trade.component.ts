import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-trade',
    imports: [],
    template: `
        <div class="p-trade">
            <div class="p-trade__title">Trade Page</div>
            <p class="p-trade__subtitle">Perform your trades here!</p>
        </div>
    `,
    styleUrls: ['./trade.component.scss']
})
export class TradeComponent {}
