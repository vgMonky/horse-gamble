import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { OngoingRacesComponent } from '@app/components/ongoing-race/ongoing-race.component';
import { HorseRaceService } from '@app/game/horse-race.service';
import {
    combineLatest,
    Subject,
    takeUntil,
    Subscription
} from 'rxjs';
import { ExpandableComponent } from '@app/components/base-components/expandable/expandable.component';
import { ExpandableGroupComponent } from '@app/components/base-components/expandable/expandable-group.component';
import { ExpandableManagerService } from '@app/components/base-components/expandable/expandable-manager.service';

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
export class RacesComponent implements OnDestroy {
    visibleRaceIds: number[] = [];
    countdowns: Record<number, number> = {};
    private destroy$ = new Subject<void>();
    private countdownSubs = new Map<number, Subscription>();
    raceStates: Record<number, string> = {};
    expanded: { [raceId: number]: boolean } = {};

    constructor(
        private horseRaceService: HorseRaceService,
        private expandableManager: ExpandableManagerService

    ) {
        combineLatest([
            this.horseRaceService.getAllRaceIds$(),
            this.horseRaceService.getCompletedRaceIds$()
        ])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([allIds, completed]) => {
                const filtered = allIds.filter(id => !completed.includes(id));
                this.updateVisibleRaces(filtered);
            });
    }

    getDistance(raceId: number): number {
        return this.horseRaceService.manager.getWinningDistance(raceId) / 10;
    }

    private updateVisibleRaces(newIds: number[]): void {
        // Unsubscribe from removed races
        const removed = this.visibleRaceIds.filter(id => !newIds.includes(id));
        removed.forEach(id => {
            this.countdownSubs.get(id)?.unsubscribe();
            this.countdownSubs.delete(id);
            delete this.countdowns[id];
        });

        // Subscribe to new races
        newIds.forEach(id => {
            if (!this.countdownSubs.has(id)) {
                const sub = this.horseRaceService.manager
                    .getCountdown$(id)
                    .subscribe(cnt => {
                        this.countdowns[id] = cnt;
                    });
                this.countdownSubs.set(id, sub);
            }

            // race state sub
            this.horseRaceService.manager.getRaceState$(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(state => {
                this.raceStates[id] = state;
            });
        });

        this.visibleRaceIds = newIds;

        // Open first expandable only if none are open
        if (!this.expandableManager.isAnyOpen(newIds.map(id => 'race-' + id))) {
            this.expandableManager.open('race-' + newIds[0]);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.countdownSubs.forEach(sub => sub.unsubscribe());
        this.countdownSubs.clear();
    }
}