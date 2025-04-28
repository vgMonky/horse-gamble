import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild
} from '@angular/core';
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
            'horse0',
            'assets/game-img/sprite-sheet/horse-sprite-sheet-0.png',
            { frameWidth: 575, frameHeight: 434 }
        );
    }

    create() {
        this.horseSprite = this.add.sprite(150, 100, 'horse0');
        this.anims.create({
            key: 'run1',
            frames: this.anims.generateFrameNumbers('horse0', { frames: [0,1,2,3,4,5,6,7,8] }),
            frameRate: 13,
            repeat: -1,
        });
        this.horseSprite.setScale(0.3).play('run1');
    }
}
