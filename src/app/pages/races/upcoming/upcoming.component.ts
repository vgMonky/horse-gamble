// src/app/pages/explore/explore.component.ts
import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

@Component({
    standalone: true,
    selector: 'app-upcoming',
    imports: [SharedModule],
    template: `
        <div class="p-upcoming">
            <div class="p-upcoming__title">{{ 'PAGES.UPCOMING.TITLE' | translate }}</div>
        </div>
    `,
    styleUrls: ['./upcoming.component.scss']
})
export class UpcomingComponent {}
