// src/app/components/phaser-canvas/game_visuals/horses_layers.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingHorsesList,
    OngoingHorse
} from '@app/game/ongoing-race.service';

export interface HorseAnimConfig {
    index:   number;
    originX: number;
    y:       number;
    scale?:  number;
    frames?: number[];
}

class HorseLayer {
    public sprite: Phaser.GameObjects.Sprite;
    constructor(
        private scene: Phaser.Scene,
        public  cfg:   HorseAnimConfig
    ) {
        const { originX, y, scale = 0.33, frames = [0,1,2,3,4,5,6,7,8] } = cfg;
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
    private layers:        HorseLayer[]           = [];
    private sub?:          Subscription;
    private finished =     false;

    /** pixel baseline for each horse once finish hits */
    private baselineX:     Record<number, number> = {};

    /** last logical position per horse */
    private lastPos:       Record<number, number> = {};

    private readonly pxFactor = 10;
    private readonly pxFactorMultiplier = 20;

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
        this.sub = this.raceSvc.horsesList$.subscribe((list: OngoingHorsesList) => {
            const placed = list.getByPlacement();
            if (!placed.length) return;

            // 1) first emission: build layers & init lastPos
            if (!this.layers.length) {
                list.getAll().forEach((h, i) => {
                    const laneY   = 148 + i * 10;
                    const originX = 400;
                    const layer = new HorseLayer(this.scene, {
                        index:   h.horse.index,
                        originX,
                        y:       laneY
                    });
                    this.layers.push(layer);
                    this.lastPos[h.horse.index] = h.position!;
                });
            }

            const leaderPos    = placed[0].position!;
            const finishDist   = this.raceSvc.winningDistance;
            const cameraAnchor = Math.min(leaderPos, finishDist);

            // 2) on first crossing, snapshot true last positions
            if (!this.finished && leaderPos >= finishDist) {
                this.finished = true;
                this.layers.forEach(layer => {
                    const idx = layer.cfg.index;
                    this.baselineX[idx] = layer.sprite.x;
                    // IMPORTANT: use actual horse position, not finishDist
                    const horse = placed.find(p => p.horse.index === idx)!;
                    this.lastPos[idx] = horse.position!;
                });
            }

            // 3) reposition each layer
            this.layers.forEach(layer => {
                const idx = layer.cfg.index;
                const h   = placed.find(p => p.horse.index === idx)!;

                if (!this.finished) {
                    // pre-finish: lock leader at originX
                    const delta = h.position! - cameraAnchor;
                    layer.sprite.x = layer.cfg.originX + this.pxFactor * delta;
                } else {
                    // post-finish: only advance by (currentPos - lastPos)
                    const deltaPos    = h.position! - this.lastPos[idx];
                    const extraPixels = deltaPos * this.pxFactorMultiplier;
                    const newX        = this.baselineX[idx] + extraPixels;

                    layer.sprite.x      = newX;
                    this.baselineX[idx] = newX;  // update baseline for next tick
                }

                // always update last logical pos
                this.lastPos[idx] = h.position!;
            });
        });
    }

    update(_time:number, _delta:number): void {
        // nothing here
    }

    destroy(): void {
        this.sub?.unsubscribe();
    }
}
