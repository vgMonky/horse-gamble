// src/app/components/phaser-canvas/game_visuals/horses_layers.ts
import { OngoingRaceService } from '@app/game/ongoing-race.service';
import Phaser from 'phaser';

export interface HorseAnimConfig {
    index:   number;
    x:       number;
    y:       number;
    scale?:  number;
    frames?: number[];
}

class HorseLayer {
    public sprite: Phaser.GameObjects.Sprite;

    constructor(
        private scene: Phaser.Scene,
        private cfg: HorseAnimConfig
    ) {
        const {
            x,
            y,
            scale  = 0.33,
            frames = [0,1,2,3,4,5,6,7,8]
        } = cfg;

        const animKey = `horse_anim_${cfg.index}`;
        if (!this.scene.anims.exists(animKey)) {
            this.scene.anims.create({
                key:       animKey,
                frames:    this.scene.anims.generateFrameNumbers('horseSpriteSheet', { frames }),
                frameRate: 12,
                repeat:    -1
            });
        }

        this.sprite = this.scene.add
            .sprite(x, y, 'horseSpriteSheet')
            .setScale(scale)
            .play(animKey);
    }
}

export class Horses {
    private layers: HorseLayer[] = [];
    private configs: HorseAnimConfig[] = [
        { index: 1,  x: 400, y: 160 },
        { index: 8,  x: 400, y: 170 },
        { index: 3,  x: 400, y: 180 },
        { index: 14, x: 400, y: 190 },
    ];

    constructor(private scene: Phaser.Scene, ongoingRaceService : OngoingRaceService) {}

    preload(): void {
        this.scene.load.spritesheet(
            'horseSpriteSheet',
            'assets/game-img/sprite-sheet/horse-sprite-sheet-0.png',
            { frameWidth: 575, frameHeight: 434 }
        );
    }

    create(): void {
        // instantiate one HorseLayer per config
        this.layers = this.configs.map(cfg => new HorseLayer(this.scene, cfg));
    }

    update(_time: number, _delta: number): void {
        // nothing dynamic yet
    }

    destroy(): void {
        // no subscriptions to clean up
    }
}
