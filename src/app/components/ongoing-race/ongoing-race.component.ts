import {
    Component,
    ViewChild,
    Input,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { OngoingListUiComponent } from '@app/components/ongoing-list-ui/ongoing-list-ui.component';
import { HorseRaceService } from '@app/game/horse-race.service';
import { WindowContainerComponent } from '@app/components/base-components/window-container/window-container.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BREAKPOINT } from 'src/types';
import { Observable, map } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-ongoing-race',
    imports: [
        SharedModule,
        CommonModule,
        PhaserCanvasComponent,
        OngoingListUiComponent,
        WindowContainerComponent
    ],
    templateUrl: './ongoing-race.component.html',
    styleUrls: ['./ongoing-race.component.scss']
})
export class OngoingRacesComponent implements OnChanges {
    @ViewChild(PhaserCanvasComponent) private canvasCmp!: PhaserCanvasComponent;
    @Input({ required: true }) raceId!: number;

    isMobileView$: Observable<boolean>;

    winPos: number = 0;
    showCanvas = true;
    isModalOpen = false;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private horseRaceService: HorseRaceService
    ) {
        this.isMobileView$ = this.breakpointObserver
        .observe(BREAKPOINT)
        .pipe(map(result => result.matches));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('raceId' in changes && this.raceId != null) {
            try {
                this.winPos = this.horseRaceService.manager.getWinningDistance(this.raceId);
            } catch (err) {
                console.error('Invalid race ID', this.raceId, err);
            }
        }
    }
}
