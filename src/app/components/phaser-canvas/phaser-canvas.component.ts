import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild
} from '@angular/core';
import { Int } from '@wharfkit/session';
import Phaser from 'phaser';

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
            width: 300,
            height: 200,
            parent: this.containerRef.nativeElement,
            scene: [MainScene],
        });
    }
}

class MainScene extends Phaser.Scene {
    private horseSprite!: Phaser.GameObjects.Sprite;

    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.spritesheet(
            'horse',
            'assets/game-img/sprite-sheet/horse-sprite-sheet-0.png',
            { frameWidth: 575, frameHeight: 434 }
        );
    }

    create() {
        this.add_horse(140,130,14)
        this.add_horse(90,130,12)
    }


    add_horse(x:integer, y:integer, rate:integer) {
        this.horseSprite = this.add.sprite(x, y, 'horse');
        this.anims.create({
            key: String(rate),
            frames: this.anims.generateFrameNumbers('horse', { frames: [0,1,2,3,4,5,6,7,8] }),
            frameRate: rate,
            repeat: -1,
        });
        this.horseSprite.setScale(0.3).play(String(rate));
    }
}
