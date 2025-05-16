// src/app/components/phaser-canvas/game_visuals/horses_layers.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingHorsesList,
    OngoingHorse
} from '@app/game/ongoing-race.service';
import { SLOT_COLOR_MAP } from '@app/game/ongoing-race.service';

export interface HorseAnimConfig {
    index:            number;
    originX:          number;
    y:                number;
    scale?:           number;
    frames?:          number[];
    frameRate?:       number;
    showMarker?:      boolean;
    markerOffsetX?:   number;
    markerOffsetY?:   number;
    showGate?:        boolean;
    gateScale?:       number;
    gateOriginX?:     number;
    gateOffsetY?:     number;
    gateSlideSpeed?:  number;
}

/** optional finish‐post configuration */
interface FinishConfig {
    scale?:   number;
    yOffset?: number;
    depth?:   number;
}

class HorseLayer {
    public sprite:           Phaser.GameObjects.Sprite;
    public marker?:          Phaser.GameObjects.Rectangle;
    public gate?:            Phaser.GameObjects.Sprite;
    public targetX!:         number;
    private gateSlideSpeed:  number;

    constructor(
        private scene:           Phaser.Scene,
        public  cfg:             HorseAnimConfig,
        private markerOpacityGetter: () => number
    ) {
        const {
            index,
            originX,
            y,
            scale            = 0.33,
            frames           = [0,1,2,3,4,5,6,7,8],
            frameRate        = 20,
            showMarker       = false,
            markerOffsetX    = 0,
            markerOffsetY    = -10,
            showGate         = false,
            gateScale        = scale,
            gateOriginX      = originX,
            gateOffsetY      = 0,
            gateSlideSpeed   = 0.05
        } = cfg;

        this.gateSlideSpeed = gateSlideSpeed;

        const spriteSheetKey = `horseSpriteSheet${index}`;
        const animKey        = `horse_anim_${index}`;

        if (!scene.anims.exists(animKey)) {
            scene.anims.create({
                key: animKey,
                frames: scene.anims.generateFrameNumbers(spriteSheetKey, { frames }),
                frameRate,
                repeat: -1
            });
        }

        this.sprite = scene.add
            .sprite(originX, y, spriteSheetKey)
            .setScale(scale)
            .play(animKey)
            .setDepth(index * 2);

        this.targetX = originX;

        if (showGate) {
            this.gate = scene.add
                .sprite(gateOriginX, y + gateOffsetY, 'startingGate')
                .setScale(gateScale)
                .setOrigin(0.5, 0)
                .setDepth(index * 2 + 1);
        }

        if (showMarker) {
            this.marker = scene.add
                .rectangle(
                    originX + markerOffsetX,
                    y + markerOffsetY,
                    3,
                    20,
                    hslStringToPhaserColor(SLOT_COLOR_MAP[index], +30)
                )
                .setOrigin(0.5, 1)
                .setDepth(100)
                .setAlpha(this.markerOpacityGetter());
        }
    }

    updateMarkerOpacity(): void {
        if (this.marker) {
            this.marker.setAlpha(this.markerOpacityGetter());
        }
    }
}

export class Horses {
    private layers:         HorseLayer[]      = [];
    private sub?:           Subscription;
    private raceStateSub?:  Subscription;
    private raceState:      'pre' | 'in' | 'post' = 'pre';
    private finished        = false;
    private baselineX:      Record<number, number> = {};
    private lastPos:        Record<number, number> = {};
    private finishPost!:    Phaser.GameObjects.Image;
    private finishTweened   = false;

    /** default finish‐post settings */
    private finishScale   = 0.145;
    private finishYOffset = -35;
    private finishDepth   = -1;

    private readonly pxFactor                = 10;
    private readonly pxFactorMultiplier      = 20;
    private readonly slideVelocity           = 0.05;
    private readonly slideVelocityMultiplier = 15;

    constructor(
        private scene:    Phaser.Scene,
        private raceSvc:  OngoingRaceService,
        private markerOpacityGetter: () => number,
        finishConfig?: FinishConfig
    ) {
        if (finishConfig) {
            this.finishScale   = finishConfig.scale   ?? this.finishScale;
            this.finishYOffset = finishConfig.yOffset ?? this.finishYOffset;
            this.finishDepth   = finishConfig.depth   ?? this.finishDepth;
        }
    }

    preload(): void {
        for (let i = 0; i <= 3; i++) {
            this.scene.load.spritesheet(
                `horseSpriteSheet${i}`,
                `assets/game-img/sprite-sheet/horse-sprite-sheet-${i}.png`,
                { frameWidth: 575, frameHeight: 434 }
            );
        }
        this.scene.load.image(
            'startingGate',
            'assets/game-img/sprite-sheet/starting-gate.png'
        );
        this.scene.load.image(
            'finishPost',
            'assets/game-img/sprite-sheet/finish-post.png'
        );
    }

    create(): void {
        // pre‐create finish-post off-screen, hidden
        const originX    = 480;
        // use full screen width, not half, so it starts truly off-screen
        const offscreenX = originX + this.scene.scale.width;
        const finishY    = this.scene.scale.height + this.finishYOffset;
        this.finishPost = this.scene.add.image(offscreenX, finishY, 'finishPost')
            .setOrigin(0.5, 1)
            .setScale(this.finishScale)
            .setScrollFactor(0)
            .setDepth(this.finishDepth)
            .setVisible(false);

        this.sub = this.raceSvc.horsesList$.subscribe((list: OngoingHorsesList) => {
            const placed    = list.getByPlacement();
            if (!placed.length) return;

            const slotToRank = new Map<number, number>();
            placed.forEach((h, i) => slotToRank.set(h.slot, i));

            if (!this.layers.length) {
                list.getAll().forEach(h => {
                    const laneY     = 148 + h.slot * 10;
                    const frameRate = 20 - (slotToRank.get(h.slot) ?? 3);

                    const layer = new HorseLayer(
                        this.scene,
                        {
                            index:           h.slot,
                            originX,
                            y:               laneY,
                            frameRate,
                            showMarker:      true,
                            markerOffsetX:   88,
                            markerOffsetY:   19,
                            showGate:        true,
                            gateScale:       0.20,
                            gateOriginX:     450,
                            gateOffsetY:     -116,
                            gateSlideSpeed:  0.77
                        },
                        this.markerOpacityGetter
                    );

                    this.layers.push(layer);
                    this.lastPos[h.slot] = h.position!;
                });

                if (this.raceState === 'pre') {
                    this.layers.forEach(layer => layer.sprite.anims.pause());
                }
            }

            const leaderPos  = placed[0].position!;
            const finishDist = this.raceSvc.winningDistance;

            // slide in finish-post when within threshold
            const slideThreshold = 32;
            if (!this.finishTweened && leaderPos >= finishDist - slideThreshold) {
                this.finishTweened = true;
                this.finishPost.setVisible(true);

                const finishX    = originX;
                const distancePx = this.finishPost.x - finishX;
                const finishVel  = this.slideVelocity * this.slideVelocityMultiplier;
                const duration   = distancePx / finishVel;

                this.scene.tweens.add({
                    targets: this.finishPost,
                    x:       finishX,
                    duration,
                    ease:    'Linear'
                });
            }

            // once fully crossed, mark finished baseline
            if (!this.finished && leaderPos >= finishDist) {
                this.finished = true;
                this.layers.forEach(layer => {
                    const slot = layer.cfg.index;
                    this.baselineX[slot] = layer.sprite.x;
                    this.lastPos[slot]   = placed.find(p => p.slot === slot)!.position!;
                });
            }

            // update horse targetX
            this.layers.forEach(layer => {
                const slot = layer.cfg.index;
                const h    = placed.find(p => p.slot === slot);
                if (!h) return;

                if (!this.finished) {
                    const cameraAnchor = Math.min(leaderPos, finishDist);
                    const delta        = h.position! - cameraAnchor;
                    layer.targetX      = layer.cfg.originX + this.pxFactor * delta;
                } else {
                    const deltaPos  = h.position! - this.lastPos[slot];
                    const extraPx   = deltaPos * this.pxFactorMultiplier;
                    layer.targetX   = this.baselineX[slot] + extraPx;
                    this.baselineX[slot] = layer.targetX;
                }

                this.lastPos[slot] = h.position!;
            });
        });

        this.raceStateSub = this.raceSvc.raceState$.subscribe(state => {
            this.raceState = state;
            if (state === 'pre') {
                this.layers.forEach(layer => {
                    layer.sprite.anims.pause();
                    layer.sprite.setFrame(3);
                });
            } else {
                this.layers.forEach(layer => layer.sprite.anims.resume());
            }
        });
    }

    update(_time: number, delta: number): void {
        const runVel    = this.slideVelocity;
        const finishVel = this.slideVelocity * this.slideVelocityMultiplier;

        this.layers.forEach(layer => {
            if (this.raceState === 'post') {
                layer.sprite.x += finishVel * delta;
            } else {
                const velocity = this.finished ? finishVel : runVel;
                const diff     = layer.targetX - layer.sprite.x;
                if (Math.abs(diff) < velocity * delta) {
                    layer.sprite.x = layer.targetX;
                } else {
                    layer.sprite.x += Math.sign(diff) * velocity * delta;
                }
            }

            if (layer.marker) {
                const ox = layer.cfg.markerOffsetX ?? 0;
                const oy = layer.cfg.markerOffsetY ?? 0;
                layer.marker.x = layer.sprite.x + ox;
                layer.marker.y = layer.sprite.y + oy;
                layer.updateMarkerOpacity();
            }

            if ((this.raceState === 'in' || this.raceState === 'post') && layer.gate) {
                layer.gate.x -= layer['gateSlideSpeed'] * delta;
            }
        });
    }

    destroy(): void {
        this.sub?.unsubscribe();
        this.raceStateSub?.unsubscribe();
        this.finishPost?.destroy();
    }
}

function hslStringToPhaserColor(hslStr: string, lightnessAdjust = 0): number {
    const match = /^hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)$/.exec(hslStr);
    if (!match) return 0x000000;
    const h = parseInt(match[1], 10) / 360;
    const s = parseInt(match[2], 10) / 100;
    let l = parseInt(match[3], 10) / 100;
    l = Math.max(0, Math.min(1, l + lightnessAdjust / 100));
    return Phaser.Display.Color.HSLToColor(h, s, l).color;
}
