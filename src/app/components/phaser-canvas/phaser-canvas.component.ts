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
import { Subscription } from 'rxjs';
import { OngoingRaceService } from '@app/game/ongoing-race.service';

@Component({
    selector: 'app-phaser-canvas',
    templateUrl: './phaser-canvas.component.html',
    styleUrls: ['./phaser-canvas.component.scss'],
    standalone: true
})
export class PhaserCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('phaserContainer', { static: true })
    containerRef!: ElementRef;

    isMobileView = false;
    private sub = new Subscription();
    private game?: Phaser.Game;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private race: OngoingRaceService
    ) {}

    ngOnInit(): void {
        // watch viewport
        this.sub.add(
            this.breakpointObserver
                .observe(BREAKPOINT)
                .subscribe(r => this.isMobileView = r.matches)
        );

        // boot Phaser
        this.startGame();

        // whenever finalPosition$ emits, push it into our scene
        this.sub.add(
            this.race.finalPosition$
                .subscribe(distance => {
                    const scene = this.game
                        ?.scene.getScene('MainScene') as MainScene;
                    scene?.updateDistance(distance);
                })
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
        this.game?.destroy(true);
    }

    private startGame(): void {
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: 850,
            height: 250,
            parent: this.containerRef.nativeElement,
            scene: [ MainScene ]
        });
    }
}
