import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OngoingRaceService } from '@app/services/game/ongoing-race.service';
import { Subscription } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-horse-race-ui',
    imports: [CommonModule],
    templateUrl: './horse-race-ui.component.html',
    styleUrls: ['./horse-race-ui.component.scss']
})
export class HorseRaceUiComponent implements OnInit, OnDestroy {
    horses: any[] = [];
    winner: any = null;
    podium: any[] = [];
    finalPosition = 0;

    private sub = new Subscription();

    constructor(private ongoingRaceService: OngoingRaceService) {}

    ngOnInit(): void {
        this.sub.add(this.ongoingRaceService.horses$.subscribe(h => this.horses = h));
        this.sub.add(this.ongoingRaceService.winner$.subscribe(w => this.winner = w));
        this.sub.add(this.ongoingRaceService.podium$.subscribe(p => this.podium = p));
        this.sub.add(this.ongoingRaceService.finalPosition$.subscribe(fp => this.finalPosition = fp));
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    restartRace(): void {
        this.ongoingRaceService.restartRace();
    }
}
