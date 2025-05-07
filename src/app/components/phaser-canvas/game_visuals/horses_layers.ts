import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingHorsesList,
    OngoingHorse
} from '@app/game/ongoing-race.service';
import { SLOT_COLOR_MAP } from '@app/game/ongoing-race.service';


export interface HorseAnimConfig {
    index:          number; // this is now `slot`
    originX:        number;
    y:              number;
    scale?:         number;
    frames?:        number[];
    showMarker?:    boolean;
    markerOffsetX?: number;
    markerOffsetY?: number;
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
                frameRate: 16,
                repeat:    -1
            });
        }

        this.sprite = scene.add
            .sprite(originX, y, 'horseSpriteSheet')
            .setScale(scale)
            .play(key);

        this.targetX = originX;
        if (showMarker) {
            this.marker = scene.add
                .rectangle(
                    originX + markerOffsetX,
                    y + markerOffsetY,
                    3,
                    20,
                    hslStringToPhaserColor(SLOT_COLOR_MAP[cfg.index], +25)
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

    private baselineX: Record<number, number> = {};
    private lastPos:   Record<number, number> = {};

    private readonly pxFactor           = 10;
    private readonly pxFactorMultiplier = 20;
    private readonly slideVelocity           = 0.05;
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

            if (!this.layers.length) {
                list.getAll().forEach((h) => {
                    const laneY   = 148 + h.slot * 10;
                    const originX = 400;
                    const layer = new HorseLayer(this.scene, {
                        index:          h.slot, // using slot now
                        originX,
                        y:             laneY,
                        showMarker:    true,
                        markerOffsetX: 88,
                        markerOffsetY: 19
                    });
                    this.layers.push(layer);
                    this.lastPos[h.slot] = h.position!;
                });
            }

            const leaderPos    = placed[0].position!;
            const finishDist   = this.raceSvc.winningDistance;
            const cameraAnchor = Math.min(leaderPos, finishDist);

            if (!this.finished && leaderPos >= finishDist) {
                this.finished = true;
                this.layers.forEach(layer => {
                    const slot = layer.cfg.index;
                    this.baselineX[slot] = layer.sprite.x;
                    const horse = placed.find(p => p.slot === slot)!;
                    this.lastPos[slot]   = horse.position!;
                });
            }

            this.layers.forEach(layer => {
                const slot = layer.cfg.index;
                const h    = placed.find(p => p.slot === slot);
                if (!h) return;

                if (!this.finished) {
                    const delta = h.position! - cameraAnchor;
                    layer.targetX = layer.cfg.originX + this.pxFactor * delta;
                } else {
                    const deltaPos = h.position! - this.lastPos[slot];
                    const extraPx  = deltaPos * this.pxFactorMultiplier;
                    layer.targetX = this.baselineX[slot] + extraPx;
                    this.baselineX[slot] = layer.targetX;
                }

                this.lastPos[slot] = h.position!;
            });
        });
    }

    update(_time: number, delta: number): void {
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

function hslStringToPhaserColor(hslStr: string, lightnessAdjust = 0): number {
    const match = /^hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)$/.exec(hslStr);
    if (!match) return 0x000000;

    const h = parseInt(match[1], 10) / 360;
    const s = parseInt(match[2], 10) / 100;
    let l   = parseInt(match[3], 10) / 100;

    // Adjust lightness
    l = Math.max(0, Math.min(1, l + lightnessAdjust / 100));

    return Phaser.Display.Color.HSLToColor(h, s, l).color;
}
