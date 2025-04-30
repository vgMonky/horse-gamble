// src/app/components/phaser-canvas/game_visuals/main_scene.ts
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
        // ← load your cloud
        this.load.image(
            'cloud1',
            'assets/game-img/background/cloud_1.png'
        );
    }

    create(): void {
        const { width, height } = this.scale;
        // draw a sky gradient
        const g = this.add.graphics();
        const topColor    = Phaser.Display.Color.HSLToColor(0.6, 0.3, 0.6).color;
        const bottomColor = Phaser.Display.Color.HSLToColor(0.5, 0.3, 0.9).color;
        g.fillGradientStyle(
            topColor, topColor,
            bottomColor, bottomColor,
            1
        );
        g.fillRect(0, 0, width, height);
        g.setDepth(-2);


        // add some drifting clouds behind the horses
        const cloudCount = 5;
        for (let i = 0; i < cloudCount; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(20, height * 0.3);
            const cloud = this.add.image(x, y, 'cloud1')
                .setAlpha(0.8)
                .setScale(0.5)
                .setDepth(-1); // ensure it’s behind everything else

            // animate it slowly drifting to the right, then respawn on the left
            this.tweens.add({
                targets: cloud,
                x: width + cloud.width,
                duration: Phaser.Math.Between(40000, 20000),
                ease: 'Linear',
                repeat: -1,
                onRepeat: () => {
                    cloud.x = -cloud.width;
                    cloud.y = Phaser.Math.Between(20, height * 0.3);
                }
            });
        }

        // draw horses on top
        this.addHorse(400, 130, 14);
        this.addHorse(130, 130, 11);
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
