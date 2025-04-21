import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { HorseRaceUiComponent } from '@app/components/horse-race-ui/horse-race-ui.component';
import { RaceService } from '@app/services/game/race.service';
import { Subscription } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-ongoing',
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        PhaserCanvasComponent,
        HorseRaceUiComponent
    ],
    templateUrl: './ongoing.component.html',
    styleUrls: ['./ongoing.component.scss']
})
export class OngoingComponent implements OnInit, OnDestroy {
    useHorse1 = true;

    private sub = new Subscription();

    constructor(private raceService: RaceService) {}

    ngOnInit(): void {
        this.raceService.startRace();
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
        this.raceService.stopRace();
    }
}
