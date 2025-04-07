import { Component } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-trade',
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        PhaserCanvasComponent
    ],
    template: `
        <div class="p-trade">
            <div class="p-trade__title">{{ 'PAGES.HORSE-RACE.T1' | translate }}</div>
            <div class="p-trade__title">{{ 'PAGES.HORSE-RACE.T2' | translate }}</div>
            <br>
            <label>
                <input type="checkbox" [(ngModel)]="useHorse1" />
                Use Horse 1
            </label>

            <app-phaser-canvas [useHorse1]="useHorse1" />
        </div>
    `,
    styleUrls: ['./race.component.scss']
})
export class RaceComponent {
    useHorse1 = true;
}
