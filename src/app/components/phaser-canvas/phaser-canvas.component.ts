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

@Component({
    selector: 'app-phaser-canvas',
    templateUrl: './phaser-canvas.component.html',
    styleUrls: ['./phaser-canvas.component.scss'],
    standalone: true
})
export class PhaserCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('phaserContainer', { static: true }) containerRef!: ElementRef;

    isMobileView = false;
    private sub = new Subscription();
    private game?: Phaser.Game;

    constructor(private breakpointObserver: BreakpointObserver) {}

    ngOnInit(): void {
        this.sub.add(
            this.breakpointObserver
                .observe(BREAKPOINT)
                .subscribe(r => this.isMobileView = r.matches)
        );

        this.startGame();
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
            scene: [ MainScene ],
        });
    }
}
