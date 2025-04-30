// src/app/components/phaser-canvas/main_scene.ts
import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
    private horseSprites: Phaser.GameObjects.Sprite[] = [];

    constructor() {
        super('MainScene');
    }

    preload(): void {
        this.load.spritesheet(
            'horse',
            'assets/game-img/sprite-sheet/horse-sprite-sheet-0.png',
            { frameWidth: 575, frameHeight: 434 }
        );
    }

    create(): void {
        this.addHorse(400, 130, 14);
        this.addHorse(130, 130, 12);
        this.addHorse(370, 130, 13);
        this.addHorse(230, 130, 12);
    }

    private addHorse(x: number, y: number, rate: number): void {
        const horse = this.add.sprite(x, y, 'horse');
        this.anims.create({
            key: rate.toString(),
            frames: this.anims.generateFrameNumbers('horse', { frames: [0,1,2,3,4,5,6,7,8] }),
            frameRate: rate,
            repeat: -1,
        });
        horse.setScale(0.25).play(rate.toString());
        this.horseSprites.push(horse);
    }
}
