import {
    Component,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { OngoingListUiComponent } from '@app/components/ongoing-list-ui/ongoing-list-ui.component';
import { HorseRaceService } from '@app/game/horse-race.service';
import { Observable, Subscription } from 'rxjs';
import { WindowContainerComponent } from '@app/components/base-components/window-container/window-container.component';


@Component({
    standalone: true,
    selector: 'app-races',
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        PhaserCanvasComponent,
        OngoingListUiComponent,
        WindowContainerComponent
    ],
    templateUrl: './races.component.html',
    styleUrls: ['./races.component.scss']
})
export class RacesComponent {
    @ViewChild(PhaserCanvasComponent) private canvasCmp!: PhaserCanvasComponent;

    readonly winPos$: Observable<number>;
    readonly ongoingID$: Observable<number>;

    showCanvas = true;
    isModalOpen = false;

    constructor(private horseRaceService: HorseRaceService) {
        this.winPos$     = this.horseRaceService.winningDistance$;
        this.ongoingID$ = this.horseRaceService.id$;
    }
}
