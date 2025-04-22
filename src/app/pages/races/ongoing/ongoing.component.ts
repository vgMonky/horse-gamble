import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { HorseRaceUiComponent } from '@app/components/horse-race-ui/horse-race-ui.component';
import { OngoingRaceService } from '@app/services/game/ongoing-race.service';
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
    raceState: 'pre' | 'in' | 'post' = 'pre';
    countdown = 0;

    private sub = new Subscription();

    constructor(private ongoingRaceService: OngoingRaceService) {}

    ngOnInit(): void {
        this.ongoingRaceService.startOngoingRace();
        this.sub.add(this.ongoingRaceService.raceState$.subscribe(state => this.raceState = state));
        this.sub.add(this.ongoingRaceService.countdown$.subscribe(c => this.countdown = c));
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
        this.ongoingRaceService.stopOngoingRace();
    }
}
