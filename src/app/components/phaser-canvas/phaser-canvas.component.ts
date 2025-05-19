// src/app/components/phaser-canvas/phaser-canvas.component.ts
import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild
} from '@angular/core';
import Phaser from 'phaser';
import { MainScene } from './game_visuals/main_scene';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BREAKPOINT } from 'src/types';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { OngoingRaceService } from '@app/game/ongoing-race.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-phaser-canvas',
    templateUrl: './phaser-canvas.component.html',
    styleUrls: ['./phaser-canvas.component.scss'],
    standalone: true,
    imports: [ CommonModule, FormsModule ]
})
export class PhaserCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('phaserContainer', { static: true })
    containerRef!: ElementRef;

    isMobileView$: Observable<boolean>;
    markerOpacity = 1;      // default full opacity
    lightnessValue = 0.1;   // default starting value

    private game?: Phaser.Game;
    private gameSubs: Subscription[] = [];

    constructor(
        private breakpointObserver: BreakpointObserver,
        private ongoingRaceService: OngoingRaceService
    ) {
        this.isMobileView$ = this.breakpointObserver
            .observe(BREAKPOINT)
            .pipe(map(result => result.matches));
    }

    ngOnInit(): void {
        this.startGame();
    }

    ngOnDestroy(): void {
        // destroy Phaser instance
        this.game?.destroy(true);
    }

    private startGame(): void {
        // instantiate the scene
        const scene = new MainScene(
            this.ongoingRaceService,
            () => this.markerOpacity,
            () => this.lightnessValue
        );

        // boot Phaser
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: 1000,
            height: 250,
            parent: this.containerRef.nativeElement,
            scene
        });
    }
}
