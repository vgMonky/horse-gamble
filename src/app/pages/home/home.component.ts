import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-home',
    imports: [],
    template: `
        <div class="p-home">
            <div class="p-home__title">VortDEX</div>
            <p class="p-home__subtitle">A peer-to-peer marketplace where transactions occur directly between crypto traders.</p>
        </div>
    `,
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {}
