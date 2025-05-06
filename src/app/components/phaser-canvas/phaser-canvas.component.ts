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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OngoingRaceService } from '@app/game/ongoing-race.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-phaser-canvas',
    templateUrl: './phaser-canvas.component.html',
    styleUrls: ['./phaser-canvas.component.scss'],
    standalone: true,
    imports: [ CommonModule ]

})
export class PhaserCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('phaserContainer', { static: true })
    containerRef!: ElementRef;
    isMobileView$: Observable<boolean>;
    private game?: Phaser.Game;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private ongoingRaceService: OngoingRaceService
    ) {
        this.isMobileView$ = this.breakpointObserver
        .observe(BREAKPOINT)
        .pipe(
            map(result => result.matches),
        );
    }

    ngOnInit(): void {
        // boot Phaser
        this.startGame();
    }

    ngOnDestroy(): void {
        this.game?.destroy(true);
    }

    private startGame(): void {
        // pass the race service so MainScene can grab horses$
        const scene = new MainScene(this.ongoingRaceService);

        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: 850,
            height: 250,
            parent: this.containerRef.nativeElement,
            scene: scene
        });
    }
}
