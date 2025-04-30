// src/app/components/phaser-canvas/phaser-canvas.component.ts
import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild
} from '@angular/core';
import Phaser from 'phaser';
import { MainScene } from './main_scene';

@Component({
    selector: 'app-phaser-canvas',
    templateUrl: './phaser-canvas.component.html',
    styleUrls: ['./phaser-canvas.component.scss'],
    standalone: true
})
export class PhaserCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('phaserContainer', { static: true }) containerRef!: ElementRef;
    private game?: Phaser.Game;

    ngOnInit(): void {
        this.startGame();
    }

    ngOnDestroy(): void {
        this.game?.destroy(true);
    }

    private startGame(): void {
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: 800,
            height: 200,
            parent: this.containerRef.nativeElement,
            scene: [ MainScene ],
        });
    }
}
