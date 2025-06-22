import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BetService } from '@app/game/bet.service';
import { PoolService } from '@app/game/pool.service';
import { SessionService } from '@app/services/session-kit.service';
import { HorseRaceService } from '@app/game/horse-race.service';
import { BetPickUiComponent } from '../bet-pick-ui/bet-pick-ui.component';
import type { HorseSlot, HorseRaceState } from '@app/game/horse-race.abstract';
import { Observable } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-bet-ticket-ui',
    imports: [
        CommonModule,
        FormsModule,
        BetPickUiComponent
    ],
    templateUrl: './bet-ticket-ui.component.html',
    styleUrls: ['./bet-ticket-ui.component.scss']
})
export class BetTicketUiComponent implements OnChanges {
    /** The race we're betting on */
    @Input() raceId!: number;
    actor!: string;

    /** Form fields */
    pick!: HorseSlot;
    amount!: number;

    /** Tracks the race’s current state */
    raceState$!: Observable<HorseRaceState>;

    constructor(
        private betService: BetService,
        public poolService: PoolService,
        private sessionService: SessionService,
        private horseRaceService: HorseRaceService
    ) {}

    ngOnInit() {
        this.sessionService.session$.subscribe(session => {
            this.actor = String(session?.actor ?? 'Anonymous');
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if ('raceId' in changes && this.raceId != null) {
            this.raceState$ = this.horseRaceService
                .manager
                .getRaceState$(this.raceId);
        }
    }

    /** Delegate to the BetManager, then reset on success */
    async confirm() {
        await this.betService.manager.generateBet(
            this.raceId,
            this.actor,
            this.pick,
            this.amount
        );
        this.pick = 0;
        this.amount = 0;
    }
}
