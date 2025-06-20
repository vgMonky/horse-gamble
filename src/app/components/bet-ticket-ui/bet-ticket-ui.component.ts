import { Component } from '@angular/core';
import { BetService } from '@app/game/bet.service';

@Component({
  standalone: true,
  selector: 'app-bet-ticket-ui',
  imports: [],
  templateUrl: './bet-ticket-ui.component.html',
  styleUrl: './bet-ticket-ui.component.scss'
})
export class BetTicketUiComponent {
    constructor(private betService: BetService ) {}
}
