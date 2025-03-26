import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-pool',
    template: `
        <div class="p-pool">
            <div class="p-pool__title">Pool Page</div>
            <p class="p-pool__subtitle">Manage your liquidity here!</p>
        </div>
    `,
    styleUrls: ['./pool.component.scss']
})
export class PoolComponent {}
