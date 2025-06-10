// src/app/pages/explore/explore.component.ts
import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

@Component({
    standalone: true,
    selector: 'app-bets',
    imports: [SharedModule],
    template: `
        <div class="p-bets">
            <div class="p-bets__title">{{ 'PAGES.BETS.TITLE' | translate }}</div>
        </div>
    `,
    styleUrls: ['./bets.component.scss']
})
export class BetsComponent {}
