// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

@Component({
    standalone: true,
    selector: 'app-home',
    imports: [SharedModule],
    template: `
        <h2>{{ 'PAGES.HOME.TITLE' | translate }}</h2>
        <p>{{ 'PAGES.HOME.DESCRIPTION' | translate }}</p>
    `,
    styles: [`
    `]
})
export class HomeComponent {}
