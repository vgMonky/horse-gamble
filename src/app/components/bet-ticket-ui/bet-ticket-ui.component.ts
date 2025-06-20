// src/app/components/bet-ticket-ui/bet-ticket-ui.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BetService, BetMode } from '@app/game/bet.service';
import { SessionService } from '@app/services/session-kit.service';

@Component({
    standalone: true,
    selector: 'app-bet-ticket-ui',
    imports: [CommonModule, FormsModule],
    templateUrl: './bet-ticket-ui.component.html',
    styleUrls: ['./bet-ticket-ui.component.scss']
})
export class BetTicketUiComponent {
    /** The race we're betting on */
    @Input() raceId!: number;
    actor!: string;

    /** Form fields */
    mode: BetMode = 'win';
    picks = '';          // comma-separated list of horse numbers
    amount = 0;

    modes: BetMode[] = ['win', 'exacta'];

    constructor(
        private betService: BetService,
        private sessionService: SessionService
    ) {}

    ngOnInit() {
        this.sessionService.session$.subscribe(session => {
            this.actor = String(session?.actor ?? 'Anonymus');
        });
    }

    confirm() {
        const pickNumbers = this.picks
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n));

        this.betService.manager.generateBet(
            this.raceId,
            this.actor,
            this.mode,
            pickNumbers,
            this.amount
        );

        // reset picks & amount; actor stays from session
        this.mode = 'win';
        this.picks = '';
        this.amount = 0;
    }
}
