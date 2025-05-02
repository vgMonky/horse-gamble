// src/app/components/phaser-canvas/game_visuals/horses_layers.ts
import Phaser from 'phaser';

export interface HorseConfig {
    x: number;
    y: number;
    rate: number;
    scale?: number;
    frames?: number[];
}

class HorseLayer {
    public sprite: Phaser.GameObjects.Sprite;
    private animKey: string;

    constructor(private scene: Phaser.Scene, config: HorseConfig) {
        const {
            x,
            y,
            rate,
            scale = 0.33,
            frames = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        } = config;

        this.animKey = `horse_${rate}`;

        // create animation once
        if (!this.scene.anims.exists(this.animKey)) {
            this.scene.anims.create({
                key: this.animKey,
                frames: this.scene.anims.generateFrameNumbers('horse', { frames }),
                frameRate: rate,
                repeat: -1
            });
        }

        // add sprite and play
        this.sprite = this.scene.add
            .sprite(x, y, 'horse')
            .setScale(scale)
            .play(this.animKey);
    }
}

export class Horses {
    private layers: HorseLayer[] = [];

    // centralize your configs here
    private configs: HorseConfig[] = [
        { x: 400, y: 160, rate: 17 },
        { x: 230, y: 170, rate: 14 },
        { x: 370, y: 180, rate: 16 },
        { x: 290, y: 190, rate: 15 }
    ];

    constructor(private scene: Phaser.Scene) {}

    /** load horse sprite-sheet */
    preload(): void {
        this.scene.load.spritesheet(
            'horse',
            'assets/game-img/sprite-sheet/horse-sprite-sheet-0.png',
            { frameWidth: 575, frameHeight: 434 }
        );
    }

    /** instantiate each HorseLayer */
    create(): void {
        this.layers = this.configs.map(cfg => new HorseLayer(this.scene, cfg));
    }

    /** called each frame (no-op for now) */
    update(_time: number, _delta: number): void {
        // if you ever want to move horses manually, do it here
    }
}
