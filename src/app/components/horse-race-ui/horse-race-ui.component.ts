import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaceService } from '@app/services/race-service';
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

    constructor(private raceService: RaceService) {}

    ngOnInit(): void {
        this.sub.add(this.raceService.horses$.subscribe(h => this.horses = h));
        this.sub.add(this.raceService.winner$.subscribe(w => this.winner = w));
        this.sub.add(this.raceService.podium$.subscribe(p => this.podium = p));
        this.sub.add(this.raceService.finalPosition$.subscribe(fp => this.finalPosition = fp));
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    restartRace(): void {
        this.raceService.restartRace();
    }
}
