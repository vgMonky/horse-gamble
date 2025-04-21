import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

@Component({
    standalone: true,
    selector: 'app-completed',
    imports: [SharedModule],
    template: `
        <div class="p-completed">
            <div class="p-completed__title">{{ 'PAGES.COMPLETED.TITLE' | translate }}</div>
        </div>
    `,
    styleUrls: ['./completed.component.scss']
})
export class CompletedComponent {}
