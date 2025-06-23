import {
    Component,
    ViewChild,
    Input,
    OnChanges,
    SimpleChanges,
    ChangeDetectorRef
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
import type { HorseSlot, HorseRaceState } from '@app/game/horse-race.abstract';
import { BetTicketUiComponent } from '@app/components/bet-ticket-ui/bet-ticket-ui.component';

@Component({
    standalone: true,
    selector: 'app-ongoing-race',
    imports: [
        SharedModule,
        CommonModule,
        PhaserCanvasComponent,
        OngoingListUiComponent,
        WindowContainerComponent,
        BetTicketUiComponent
    ],
    templateUrl: './ongoing-race.component.html',
    styleUrls: ['./ongoing-race.component.scss']
})
export class OngoingRacesComponent implements OnChanges {
    @ViewChild(PhaserCanvasComponent) public canvasCmp!: PhaserCanvasComponent;
    @Input({ required: true }) raceId!: number;

    /** Current race state */
    raceState$!: Observable<HorseRaceState>;

    isMobileView$: Observable<boolean>;

    winPos: number = 0;
    showCanvas = true;
    isModalOpen = false;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private horseRaceService: HorseRaceService,
        private cd: ChangeDetectorRef
    ) {
        this.isMobileView$ = this.breakpointObserver
        .observe(BREAKPOINT)
        .pipe(map(result => result.matches));
    }

    /** Expose horseFollow as a HorseSlot for child binding */
    get horseFollowSlot(): HorseSlot | undefined {
        return this.canvasCmp?.horseFollow as HorseSlot | undefined;
    }

    ngAfterViewInit() {
        this.cd.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('raceId' in changes && this.raceId != null) {
            try {
                this.winPos = this.horseRaceService.manager.getWinningDistance(this.raceId);
                this.raceState$ = this.horseRaceService.manager.getRaceState$(this.raceId);
            } catch (err) {
                console.error('Invalid race ID', this.raceId, err);
            }
        }
    }
}
