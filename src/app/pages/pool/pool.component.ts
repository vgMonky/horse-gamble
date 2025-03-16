import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-trade',
    template: `
        <h2>Pool Page</h2>
    `,
    styles: [`
        :host {
            padding: 15px;
            display: block;
        }
    `]
})
export class PoolComponent {}
