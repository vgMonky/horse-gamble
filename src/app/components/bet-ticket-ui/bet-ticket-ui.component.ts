// src/app/components/bet-ticket-ui/bet-ticket-ui.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BetService, BetMode } from '@app/game/bet.service';

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

    /** Form fields */
    actor = '';
    mode: BetMode = 'win';
    picks = '';          // comma-separated list of horse numbers
    amount = 0;

    modes: BetMode[] = ['win', 'place', 'show', 'exacta', 'trifecta'];

    constructor(private betService: BetService) {}

    confirm() {
        const pickNumbers = this.picks
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n));

        this.betService.manager.generateBet(
            this.raceId,
            this.actor || 'Anonymous',
            this.mode,
            pickNumbers,
            this.amount
        );

        // you could reset the form or emit an event here
        this.actor = '';
        this.mode = 'win';
        this.picks = '';
        this.amount = 0;
    }
}
