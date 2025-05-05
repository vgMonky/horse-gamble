// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { OngoingRaceService } from '@app/game/ongoing-race.service';


@Component({
    standalone: true,
    selector: 'app-home',
    imports: [SharedModule],
    template: `
        <div class="p-home">
            <div class="p-home__title">{{ 'PAGES.HOME.TITLE' | translate }}</div>
            <p class="p-home__subtitle">{{ 'PAGES.HOME.DESCRIPTION' | translate }}</p>
        </div>
    `,
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    constructor(private ongoingRaceService: OngoingRaceService) {}

    ngAfterViewInit(): void {
        // defer race start until after the initial change detection
        setTimeout(() => {
            this.ongoingRaceService.startOngoingRace();
        }, 0);
    }

    ngOnDestroy(): void {
        this.ongoingRaceService.stopOngoingRace();
    }
}
