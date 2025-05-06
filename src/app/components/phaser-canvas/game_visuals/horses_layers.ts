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
    public sprite:   Phaser.GameObjects.Sprite;
    public targetX!: number;

    constructor(
        private scene: Phaser.Scene,
        public  cfg:   HorseAnimConfig
    ) {
        const { originX, y, scale = 0.33, frames = [0,1,2,3,4,5,6,7,8] } = cfg;
        const key = `horse_anim_${cfg.index}`;

        if (!scene.anims.exists(key)) {
            scene.anims.create({
                key,
                frames:    scene.anims.generateFrameNumbers('horseSpriteSheet', { frames }),
                frameRate: 12,
                repeat:    -1
            });
        }

        // place the sprite at origin for now
        this.sprite = scene.add
            .sprite(originX, y, 'horseSpriteSheet')
            .setScale(scale)
            .play(key);

        // initialize targetX to the starting point
        this.targetX = originX;
    }
}

export class Horses {
    private layers:        HorseLayer[]           = [];
    private sub?:          Subscription;
    private finished =     false;

    /** baseline pixel when finish first crossed */
    private baselineX:     Record<number, number> = {};

    /** last logical position per horse */
    private lastPos:       Record<number, number> = {};

    /** px offset per unit of race logic before finish */
    private readonly pxFactor               = 10;
    /** px offset per unit AFTER finish */
    private readonly pxFactorMultiplier     = 20;

    /** constant slide speed in pixels-per-millisecond */
    private readonly slideVelocity: number  = 0.05;

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

            // 1) on very first tick: build layers & init lastPos
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

            // 2) on first crossing, snapshot baseline & lastPos
            if (!this.finished && leaderPos >= finishDist) {
                this.finished = true;
                this.layers.forEach(layer => {
                    const idx = layer.cfg.index;
                    // baseline at whatever pixel they currently occupy
                    this.baselineX[idx] = layer.sprite.x;
                    // record their logical pos so deltas start from here
                    const horse = placed.find(p => p.horse.index === idx)!;
                    this.lastPos[idx] = horse.position!;
                });
            }

            // 3) compute a new targetX for each horse
            this.layers.forEach(layer => {
                const idx = layer.cfg.index;
                const h   = placed.find(p => p.horse.index === idx)!;

                if (!this.finished) {
                    // pre-finish: leader locked at origin
                    const delta    = h.position! - cameraAnchor;
                    layer.targetX  = layer.cfg.originX + this.pxFactor * delta;
                } else {
                    // post-finish: extra distance since last tick
                    const deltaPos   = h.position! - this.lastPos[idx];
                    const extraPx    = deltaPos * this.pxFactorMultiplier;
                    // advance baseline by that extra
                    layer.targetX   = this.baselineX[idx] + extraPx;
                    // update baseline for next tick
                    this.baselineX[idx] = layer.targetX;
                }

                // record for next emission
                this.lastPos[idx] = h.position!;
            });
        });
    }

    update(_time: number, delta: number): void {
        // 4) each frame, slide each sprite toward its targetX
        this.layers.forEach(layer => {
            const diff = layer.targetX - layer.sprite.x;
            if (Math.abs(diff) < this.slideVelocity * delta) {
                layer.sprite.x = layer.targetX;
            } else {
                layer.sprite.x += Math.sign(diff) * this.slideVelocity * delta;
            }
        });
    }

    destroy(): void {
        this.sub?.unsubscribe();
    }
}
