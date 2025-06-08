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
export class OngoingComponent {
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
