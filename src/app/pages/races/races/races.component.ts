import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { OngoingRacesComponent } from '@app/components/ongoing-race/ongoing-race.component';
import { HorseRaceService } from '@app/game/horse-race.service';
import { 
    combineLatest,
    Subject,
    takeUntil
} from 'rxjs';
import { ExpandableComponent } from '@app/components/base-components/expandable/expandable.component';
import { ExpandableGroupComponent } from '@app/components/base-components/expandable/expandable-group.component';


@Component({
    standalone: true,
    selector: 'app-races',
    imports: [
        SharedModule,
        CommonModule,
        OngoingRacesComponent,
        ExpandableComponent,
        ExpandableGroupComponent
    ],
    templateUrl: './races.component.html',
    styleUrls: ['./races.component.scss']
})
export class RacesComponent {
    visibleRaceIds: number[] = [];
    countdowns: Record<number, number> = {};

    private destroy$ = new Subject<void>();

    constructor(private horseRaceService: HorseRaceService) {
        combineLatest([
            this.horseRaceService.getAllRaceIds$(),
            this.horseRaceService.getCompletedRaceIds$()
        ])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([allIds, completed]) => {
                this.visibleRaceIds = allIds.filter(id => !completed.includes(id));
                this.trackCountdowns(this.visibleRaceIds);
            });
    }

    getDistance(raceId: number): number {
        return this.horseRaceService.manager.getWinningDistance(raceId) / 10;
    }

    private trackCountdowns(ids: number[]): void {
        ids.forEach(id => {
            this.horseRaceService.manager
                .getCountdown$(id)
                .pipe(takeUntil(this.destroy$))
                .subscribe(cnt => {
                    this.countdowns[id] = cnt;
                });
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
