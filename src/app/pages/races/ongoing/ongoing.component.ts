// // src/app/pages/ongoing/ongoing.component.ts
import {
    Component,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { OngoingListUiComponent } from '@app/components/ongoing-list-ui/ongoing-list-ui.component';
import { OngoingRaceService } from '@app/game/ongoing-race.service';
import { Observable } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-ongoing',
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        PhaserCanvasComponent,
        OngoingListUiComponent
    ],
    templateUrl: './ongoing.component.html',
    styleUrls: ['./ongoing.component.scss']
})
export class OngoingComponent implements AfterViewInit, OnDestroy {
    readonly raceState$: Observable<'pre' | 'in' | 'post'>;
    readonly countdown$:  Observable<number>;
    readonly winPos: number;

    constructor(private ongoingRaceService: OngoingRaceService) {
        this.raceState$ = this.ongoingRaceService.raceState$;
        this.countdown$ = this.ongoingRaceService.countdown$;
        this.winPos = this.ongoingRaceService.winningDistance
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.ongoingRaceService.startOngoingRace();
    }

    ngOnDestroy(): void {
        this.ongoingRaceService.stopOngoingRace();
    }
}
