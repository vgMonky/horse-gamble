// src/app/components/phaser-canvas/game_visuals/main_scene.ts
import Phaser from 'phaser';
import { ParallaxBackground } from './parallax_background';

export class MainScene extends Phaser.Scene {
    private horseSprites: Phaser.GameObjects.Sprite[] = [];
    private bg!: ParallaxBackground;

    constructor() {
        super('MainScene');
    }

    preload(): void {
        this.bg = new ParallaxBackground(this);
        this.bg.preload();

        this.load.spritesheet(
            'horse',
            'assets/game-img/sprite-sheet/horse-sprite-sheet-0.png',
            { frameWidth: 575, frameHeight: 434 }
        );
    }

    create(): void {
        const { width, height } = this.scale;

        // 1️⃣ sky gradient
        const g = this.add.graphics();
        const topColor    = Phaser.Display.Color.HSLToColor(0.6, 0.3, 0.6).color;
        const bottomColor = Phaser.Display.Color.HSLToColor(0.5, 0.3, 0.9).color;
        g.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
        g.fillRect(0, 0, width, height);
        g.setDepth(-7);  // behind your 6 parallax layers

        // 2️⃣ parallax background
        this.bg.create();

        // 3️⃣ horses on top
        this.addHorse(400, 160, 14);
        this.addHorse(230, 170, 11);
        this.addHorse(370, 180, 13);
        this.addHorse(290, 190, 12);
    }

    override update(time: number, delta: number): void {
        this.bg.update(time, delta);
    }

    private addHorse(x: number, y: number, rate: number): void {
        const horse = this.add.sprite(x, y, 'horse');
        this.anims.create({
            key: rate.toString(),
            frames: this.anims.generateFrameNumbers('horse', { frames: [0,1,2,3,4,5,6,7,8] }),
            frameRate: rate,
            repeat: -1,
        });
        horse.setScale(0.32).play(rate.toString());
        this.horseSprites.push(horse);
    }
}
