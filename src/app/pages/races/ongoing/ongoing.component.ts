import {
    Component,
    AfterViewInit,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { OngoingListUiComponent } from '@app/components/ongoing-list-ui/ongoing-list-ui.component';
import { HorseRaceService } from '@app/game/horse-race.service';
import { Observable, Subscription } from 'rxjs';
import { skip, filter } from 'rxjs/operators';
import { WindowContainerComponent } from '@app/components/base-components/window-container/window-container.component';


@Component({
    standalone: true,
    selector: 'app-ongoing',
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        PhaserCanvasComponent,
        OngoingListUiComponent,
        WindowContainerComponent
    ],
    templateUrl: './ongoing.component.html',
    styleUrls: ['./ongoing.component.scss']
})
export class OngoingComponent implements AfterViewInit, OnDestroy {
    @ViewChild(PhaserCanvasComponent) private canvasCmp!: PhaserCanvasComponent;

    readonly raceState$: Observable<'pre' | 'in' | 'post'>;
    readonly countdown$:  Observable<number>;
    readonly winPos: number;

    private stateSub!: Subscription;
    showCanvas = true;
    isModalOpen = false;

    constructor(private horseRaceService: HorseRaceService) {
        this.raceState$ = this.horseRaceService.raceState$;
        this.countdown$ = this.horseRaceService.countdown$;
        this.winPos     = this.horseRaceService.winningDistance;
    }

    ngAfterViewInit(): void {
        // kick off the first race
        this.horseRaceService.startHorseRace();

        // whenever we re-enter 'pre', reload the canvas
        this.stateSub = this.raceState$.pipe(
            skip(1),
            filter(state => state === 'pre')
        ).subscribe(() => this.reloadCanvas());
    }

    private reloadCanvas(): void {
        // turn off → turn on to force Angular to destroy & re-create the PhaserCanvasComponent
        setTimeout(() => {
            this.showCanvas = false;
            setTimeout(() => this.showCanvas = true, 0);
        }, 0);
    }

    ngOnDestroy(): void {
        this.stateSub.unsubscribe();
        this.horseRaceService.stopOngoingRace();
    }
}
