import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-trade',
    template: `
        <h2>Pool Page</h2>
    `,
    styles: [`
        @use 'mixin' as *;

        :host {
            @include page;
        }
    `]
})
export class PoolComponent {}
