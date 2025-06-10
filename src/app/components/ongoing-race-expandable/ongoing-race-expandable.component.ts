import {
    Component,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { OngoingListUiComponent } from '@app/components/ongoing-list-ui/ongoing-list-ui.component';
import { HorseRaceService } from '@app/game/horse-race.service';
import { WindowContainerComponent } from '@app/components/base-components/window-container/window-container.component';


@Component({
    standalone: true,
    selector: 'app-ongoing-race-expandable',
    imports: [
        SharedModule,
        CommonModule,
        PhaserCanvasComponent,
        OngoingListUiComponent,
        WindowContainerComponent
    ],
    templateUrl: './ongoing-race-expandable.component.html',
    styleUrls: ['./ongoing-race-expandable.component.scss']
})
export class OngoingRacesExpandableComponent {
    @ViewChild(PhaserCanvasComponent) private canvasCmp!: PhaserCanvasComponent;

    readonly winPos: number;
    readonly ID: number;

    showCanvas = true;
    isModalOpen = false;

    constructor(private horseRaceService: HorseRaceService) {
        this.winPos     = this.horseRaceService.manager.getWinningDistance(1);
        this.ID = this.horseRaceService.manager.getRaceId(1);
    }
}
