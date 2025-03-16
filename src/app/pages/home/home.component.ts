import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-home',
    imports: [],
    template: `
        <h2>DEX</h2>
        <p>A peer-to-peer marketplace where transactions occur directly between crypto traders.</p>
    `,
    styles: [`
        :host {
            padding: 15px;
            display: block;
        }
    `]
})
export class HomeComponent {}
