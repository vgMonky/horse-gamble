// src/app/components/bet-pick-ui/bet-pick-ui.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DropDownComponent } from '../base-components/drop-down/drop-down.component';
import { CommonModule } from '@angular/common';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    RaceHorse,
    SLOT_COLOR_MAP,
    HorseSlot
} from '@app/game/horse-race.abstract';
import { HorseRaceService } from '@app/game/horse-race.service';
import { PoolService } from '@app/game/pool.service';

interface PickOption {
    horse: RaceHorse;
    color: string;
    odd: number;
}

@Component({
    selector: 'app-bet-pick-ui',
    standalone: true,
    imports: [DropDownComponent, CommonModule],
    templateUrl: './bet-pick-ui.component.html',
    styleUrls: ['./bet-pick-ui.component.scss']
})
export class BetPickUiComponent implements OnChanges, OnDestroy {
    @Input() raceId!: number;
    @Input() selected?: HorseSlot;
    @Output() selectedChange = new EventEmitter<HorseSlot>();

    options$!: Observable<PickOption[]>;
    private optsSub?: Subscription;
    private latestOptions: PickOption[] = [];

    constructor(
        private horseRaceService: HorseRaceService,
        private poolService: PoolService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['raceId'] && this.raceId != null) {
            const horses$ = this.horseRaceService
                .manager
                .getHorsesList$(this.raceId)
                .pipe(map(list => list.getAll()));

            const pool = this.poolService.manager.getPool(this.raceId);
            const odds$ = pool
                ? pool.odds$
                : of([0, 0, 0, 0]);

            this.options$ = combineLatest([horses$, odds$]).pipe(
                map(([horses, odds]) =>
                    horses.map(h => ({
                        horse: h,
                        color: SLOT_COLOR_MAP[h.slot],
                        odd: odds[h.slot] ?? 0
                    }))
                )
            );

            // keep latestOptions up to date
            this.optsSub?.unsubscribe();
            this.optsSub = this.options$.subscribe(arr => this.latestOptions = arr);
        }
    }

    ngOnDestroy() {
        this.optsSub?.unsubscribe();
    }

    onSelect(slot: HorseSlot) {
        this.selectedChange.emit(slot);
    }

    /** background color helper */
    getColor(slot: HorseSlot): string {
        return SLOT_COLOR_MAP[slot] ?? 'black';
    }

    /** look up the selected option so we can get its horse.index */
    getSelectedHorseIndex(): number | '?' {
        const opt = this.latestOptions.find(o => o.horse.slot === this.selected);
        return opt ? opt.horse.horse.index : '?';
    }
}
