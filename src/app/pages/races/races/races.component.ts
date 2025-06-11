import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { OngoingRacesComponent } from '@app/components/ongoing-race/ongoing-race.component';
import { HorseRaceService } from '@app/game/horse-race.service';
import { combineLatest } from 'rxjs';
import { ExpandableComponent } from '@app/components/base-components/expandable/expandable.component';
import { ExpandableGroupComponent } from '@app/components/base-components/expandable/expandable-group.component';


@Component({
    standalone: true,
    selector: 'app-races',
    imports: [
        SharedModule,
        CommonModule,
        OngoingRacesComponent
    ],
    templateUrl: './races.component.html',
    styleUrls: ['./races.component.scss']
})
export class RacesComponent {
    visibleRaceIds: number[] = [];

    constructor(private horseRaceService: HorseRaceService) {
        combineLatest([
            this.horseRaceService.getAllRaceIds$(),
            this.horseRaceService.getCompletedRaceIds$()
        ]).subscribe(([allIds, completed]) => {
            this.visibleRaceIds = allIds.filter(id => !completed.includes(id));
        });
    }
}
