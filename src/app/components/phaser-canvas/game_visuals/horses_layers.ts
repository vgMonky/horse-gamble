// src/app/components/phaser-canvas/game_visuals/horses_layers.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingHorsesList,
    OngoingHorse
} from '@app/game/ongoing-race.service';

export interface HorseAnimConfig {
    index:   number;   // matches OngoingHorse.horse.index
    originX: number;   // starting X in px
    y:       number;   // lane Y in px
    scale?:  number;
    frames?: number[];
}

class HorseLayer {
    public sprite: Phaser.GameObjects.Sprite;

    constructor(
        private scene: Phaser.Scene,
        public  cfg:   HorseAnimConfig
    ) {
        const {
            originX,
            y,
            scale  = 0.33,
            frames = [0,1,2,3,4,5,6,7,8]
        } = cfg;
        const key = `horse_anim_${cfg.index}`;

        if (!scene.anims.exists(key)) {
            scene.anims.create({
                key,
                frames:    scene.anims.generateFrameNumbers('horseSpriteSheet',{ frames }),
                frameRate: 12,
                repeat:    -1
            });
        }

        this.sprite = scene.add
            .sprite(originX, y, 'horseSpriteSheet')
            .setScale(scale)
            .play(key);
    }
}

export class Horses {
    private layers: HorseLayer[] = [];
    private sub?:   Subscription;

    /** px per “meter” */
    private readonly mtr = 6;

    constructor(
        private scene:   Phaser.Scene,
        private raceSvc: OngoingRaceService
    ) {}

    preload(): void {
        this.scene.load.spritesheet(
            'horseSpriteSheet',
            'assets/game-img/sprite-sheet/horse-sprite-sheet-0.png',
            { frameWidth: 575, frameHeight: 434 }
        );
    }

    create(): void {
        // on every new list tick:
        this.sub = this.raceSvc.horsesList$.subscribe((list: OngoingHorsesList) => {
            // 1) first emission: build layers once
            if (this.layers.length === 0) {
                const entries = list.getAll();
                entries.forEach((h, i) => {
                    const laneY   = 148 + i * 10;   // or whatever spacing you like
                    const originX = 400;
                    const cfg: HorseAnimConfig = {
                        index:   h.horse.index,
                        originX,
                        y:       laneY
                    };
                    this.layers.push(new HorseLayer(this.scene, cfg));
                });
            }

            // 2) reposition on *every* emission
            this.positionLayers(list.getByPlacement());
        });
    }

    update(_time: number, _delta: number): void {
        // we don’t need per-frame logic here—
        // repositioning happens in the subscription
    }

    destroy(): void {
        this.sub?.unsubscribe();
    }

    private positionLayers(placed: OngoingHorse[]) {
        if (placed.length === 0) return;

        // Absolute leader position in meters
        const leaderPos     = placed[0].position!;

        // Anchor at finish line (never exceed winningDistance)
        const cameraAnchor  = Math.min(leaderPos, this.raceSvc.winningDistance);

        // Reposition every horse around that anchor
        this.layers.forEach(layer => {
            const h        = placed.find(p => p.horse.index === layer.cfg.index)!;
            const originX  = layer.cfg.originX;

            // how many meters ahead/behind of the camera anchor
            const deltaM   = h.position! - cameraAnchor;

            // final X on screen
            layer.sprite.x = originX + this.mtr * deltaM;
        });
    }

    private posToMtr(pos: number): number {
        return pos * this.mtr;
    }
}
