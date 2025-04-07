import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { RaceService } from '@app/services/race-service';
import { Subscription } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-trade',
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        PhaserCanvasComponent
    ],
    templateUrl: './race.component.html',
    styleUrls: ['./race.component.scss']
})
export class RaceComponent implements OnInit, OnDestroy {
    useHorse1 = true;
    horses: any[] = [];
    winner: any = null;
    podium: any[] = [];

    private sub = new Subscription();

    constructor(private raceService: RaceService) {}

    ngOnInit(): void {
        this.sub.add(this.raceService.horses$.subscribe(h => this.horses = h));
        this.sub.add(this.raceService.winner$.subscribe(w => this.winner = w));
        this.sub.add(this.raceService.podium$.subscribe(p => this.podium = p));
        this.raceService.startRace();
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
        this.raceService.stopRace();
    }
}
