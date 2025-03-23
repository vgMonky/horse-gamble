// src/app/pages/explore/explore.component.ts
import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

@Component({
    standalone: true,
    selector: 'app-explore',
    imports: [SharedModule],
    template: `
        <h2>{{ 'PAGES.EXPLORE.TITLE' | translate }}</h2>
        <p>{{ 'PAGES.EXPLORE.DESCRIPTION' | translate }}</p>
    `,
    styles: [`
    `]
})
export class ExploreComponent {}
