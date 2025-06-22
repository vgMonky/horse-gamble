// src/app/components/bet-ticket-ui/bet-ticket-ui.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BetService } from '@app/game/bet.service';
import { PoolService } from '@app/game/pool.service';
import { SessionService } from '@app/services/session-kit.service';
import { BetPickUiComponent } from '../bet-pick-ui/bet-pick-ui.component';

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
export class BetTicketUiComponent {
    /** The race we're betting on */
    @Input() raceId!: number;
    actor!: string;

    /** Form fields */
    pick!:number;
    amount!:number;

    constructor(
        private betService: BetService,
        public poolService: PoolService,
        private sessionService: SessionService
    ) {}

    ngOnInit() {
        this.sessionService.session$.subscribe(session => {
            this.actor = String(session?.actor ?? 'Anonymus');
        });
    }

    confirm() {
        this.betService.manager.generateBet(
            this.raceId,
            this.actor,
            this.pick,
            this.amount
        );

        // reset pick & amount
        this.pick = 0;
        this.amount = 10;
    }
}
