// src/app/components/phaser-canvas/game_visuals/horses_layers.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingHorsesList,
    OngoingHorse
} from '@app/game/ongoing-race.service';

export interface HorseAnimConfig {
    index:          number;
    originX:        number;
    y:              number;
    scale?:         number;
    frames?:        number[];
    showMarker?:    boolean;   // whether to draw the marker
    markerOffsetX?: number;    // horizontal adjustment for the marker
    markerOffsetY?: number;    // vertical adjustment for the marker
}

class HorseLayer {
    public sprite:   Phaser.GameObjects.Sprite;
    public marker?:  Phaser.GameObjects.Rectangle;
    public targetX!: number;

    constructor(
        private scene: Phaser.Scene,
        public  cfg:   HorseAnimConfig
    ) {
        const {
            originX,
            y,
            scale           = 0.33,
            frames          = [0,1,2,3,4,5,6,7,8],
            showMarker      = false,
            markerOffsetX   = 0,
            markerOffsetY   = -10
        } = cfg;

        const key = `horse_anim_${cfg.index}`;
        if (!scene.anims.exists(key)) {
            scene.anims.create({
                key,
                frames:    scene.anims.generateFrameNumbers('horseSpriteSheet', { frames }),
                frameRate: 12,
                repeat:    -1
            });
        }

        // 1) horse sprite
        this.sprite = scene.add
            .sprite(originX, y, 'horseSpriteSheet')
            .setScale(scale)
            .play(key);

        // 2) initial target and optional marker
        this.targetX = originX;
        if (showMarker) {
            this.marker = scene.add
                .rectangle(
                    originX + markerOffsetX,
                    y + markerOffsetY,
                    3,
                    20,
                    0xff0000
                )
                .setOrigin(0.5, 1)
                .setDepth(10);
        }
    }
}

export class Horses {
    private layers:    HorseLayer[]           = [];
    private sub?:      Subscription;
    private finished = false;

    /** pixel baseline for each horse once finish hits */
    private baselineX: Record<number, number> = {};

    /** last logical position per horse */
    private lastPos:   Record<number, number> = {};

    /** px offset per unit before finish */
    private readonly pxFactor           = 10;
    /** px offset per unit after finish */
    private readonly pxFactorMultiplier = 20;

    /** slide speed in px per ms (pre‐finish) */
    private readonly slideVelocity           = 0.05;
    /** multiplier for slide speed once finish line is reached */
    private readonly slideVelocityMultiplier = 10;

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

            // 1) on first tick: build layers & init lastPos
            if (!this.layers.length) {
                list.getAll().forEach((h, i) => {
                    const laneY   = 148 + i * 10;
                    const originX = 400;
                    const layer = new HorseLayer(this.scene, {
                        index:          h.horse.index,
                        originX,
                        y:             laneY,
                        showMarker:    true,  // toggle per-horse as needed
                        markerOffsetX: 88,     // adjust to align with nose
                        markerOffsetY: 19     // adjust to align vertically
                    });
                    this.layers.push(layer);
                    this.lastPos[h.horse.index] = h.position!;
                });
            }

            const leaderPos    = placed[0].position!;
            const finishDist   = this.raceSvc.winningDistance;
            const cameraAnchor = Math.min(leaderPos, finishDist);

            // 2) snapshot on first crossing
            if (!this.finished && leaderPos >= finishDist) {
                this.finished = true;
                this.layers.forEach(layer => {
                    const idx = layer.cfg.index;
                    this.baselineX[idx] = layer.sprite.x;
                    const horse = placed.find(p => p.horse.index === idx)!;
                    this.lastPos[idx]   = horse.position!;
                });
            }

            // 3) compute targetX per horse
            this.layers.forEach(layer => {
                const idx = layer.cfg.index;
                const h   = placed.find(p => p.horse.index === idx)!;

                if (!this.finished) {
                    const delta = h.position! - cameraAnchor;
                    layer.targetX = layer.cfg.originX + this.pxFactor * delta;
                } else {
                    const deltaPos = h.position! - this.lastPos[idx];
                    const extraPx  = deltaPos * this.pxFactorMultiplier;
                    layer.targetX = this.baselineX[idx] + extraPx;
                    this.baselineX[idx] = layer.targetX;
                }

                this.lastPos[idx] = h.position!;
            });
        });
    }

    update(_time: number, delta: number): void {
        // choose velocity based on finished state
        const velocity = this.finished
            ? this.slideVelocity * this.slideVelocityMultiplier
            : this.slideVelocity;

        this.layers.forEach(layer => {
            const diff = layer.targetX - layer.sprite.x;
            if (Math.abs(diff) < velocity * delta) {
                layer.sprite.x = layer.targetX;
            } else {
                layer.sprite.x += Math.sign(diff) * velocity * delta;
            }
            if (layer.marker) {
                const ox = layer.cfg.markerOffsetX ?? 0;
                const oy = layer.cfg.markerOffsetY ?? 0;
                layer.marker.x = layer.targetX + ox;
                layer.marker.y = layer.sprite.y + oy;
            }
        });
    }

    destroy(): void {
        this.sub?.unsubscribe();
    }
}
