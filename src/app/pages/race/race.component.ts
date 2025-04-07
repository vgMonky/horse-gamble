import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

@Component({
    standalone: true,
    selector: 'app-trade',
    imports: [SharedModule],
    template: `
        <div class="p-trade">
            <div class="p-trade__title">{{ 'PAGES.HORSE-RACE.T1' | translate }}</div>
            <p class="p-trade__subtitle">{{ 'PAGES.HORSE-RACE.T2' | translate }}</p>
        </div>
    `,
    styleUrls: ['./race.component.scss']
})
export class RaceComponent {}
