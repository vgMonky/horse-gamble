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
        @use 'mixin' as *;

        :host {
            @include page;
        }
    `]
})
export class TradeComponent {}
