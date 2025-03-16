import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-trade',
    imports: [],
    template: `
        <h2>Trade Page</h2>
        <p>Perform your trades here!</p>
    `,
    styles: [`
        :host {
            padding: 15px;
            display: block;
        }
    `]
})
export class TradeComponent {}
