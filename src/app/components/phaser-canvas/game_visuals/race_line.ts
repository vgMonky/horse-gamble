// src/app/components/phaser-canvas/game_visuals/race_line.ts
import Phaser from 'phaser';
import type {
    OngoingRaceService,
    OngoingHorsesList,
    OngoingRaceState
} from '@app/game/horse-race.service';
import { SLOT_COLOR_MAP } from '@app/game/horse-race.service';
import { Subscription } from 'rxjs';

export class RaceLineLayer {
    private cam: Camera;

    constructor(
        private scene: Phaser.Scene,
        private ongoingRaceService: OngoingRaceService,
        private getMarkerOpacity: () => number
    ) {
        this.cam = new Camera(this.scene, this.ongoingRaceService, this.getMarkerOpacity);
        // ensure we clean up when the scene shuts down
        this.scene.events.once('shutdown', () => this.destroy());
    }

    preload(): void {
        this.scene.load.image('img_final_post', 'assets/game-img/sprite-sheet/finish-post.png');
        this.scene.load.image('img_start_gate', 'assets/game-img/sprite-sheet/starting-gate.png');

        for (let i = 0; i <= 3; i++) {
            this.scene.load.spritesheet(
                `horseSpriteSheet${i}`,
                `assets/game-img/sprite-sheet/horse-sprite-sheet-${i}.png`,
                { frameWidth: 575, frameHeight: 434 }
            );
        }
    }

    create(): void {
        this.cam.updateCam();
    }

    update(time: number, delta: number): void {
        this.cam.updateCam();
    }

    /** clean up subscription & graphics */
    destroy(): void {
        this.cam.destroy();
    }
}

class Camera {
    public pos = 0;
    public origin: { x: number; y: number };
    private graphics: Phaser.GameObjects.Graphics;
    private posToPx = 20;
    private raceSvc: OngoingRaceService;
    private horsesList!: OngoingHorsesList;
    private raceState: OngoingRaceState = 'pre';
    private sub = new Subscription();
    private images: Map<string, Phaser.GameObjects.Image> = new Map();
    private sprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private shadows: Map<string, Phaser.GameObjects.Ellipse> = new Map();

    constructor(
        private scene: Phaser.Scene,
        raceSvc: OngoingRaceService,
        private getMarkerOpacity: () => number,
        origin?: { x: number; y: number }
    ) {
        this.raceSvc = raceSvc;
        this.origin = origin ?? { x: 0.5, y: 0.5 };
        this.graphics = this.scene.add.graphics();

        // add both subscriptions to the composite
        this.sub.add(
            this.raceSvc.horsesList$.subscribe(list => {
                this.horsesList = list;
            })
        );
        this.sub.add(
            this.raceSvc.raceState$.subscribe(state => {
                this.raceState = state;
            })
        );
    }

    updateCam(): void {
        // Set cam game position
        if (this.pos < this.raceSvc.winningDistance) {
            const first = this.horsesList.getByPlacement()[0].position;
            if (first < this.raceSvc.winningDistance) {
                this.pos = first;
            } else {
                this.pos = this.raceSvc.winningDistance;
            }
        }

        // interpolate origin.x between start(0.5) and finalOrigin
        const finalOriginX = 0.63;
        const progress    = Phaser.Math.Clamp(this.pos / this.raceSvc.winningDistance, 0, 1);
        this.origin.x     = Phaser.Math.Interpolation.Linear([0.5, finalOriginX], progress);

        // Calculate and draw cam point of view
        this.graphics.setDepth(100); // apply depth to current graphics(Cross and Points)
        this.drawView();
    }

    private drawView(): void {
        this.graphics.clear();

        // Draw camera cross
        this.drawCamCross();

        // Draw race end
        this.drawCamImg(this.raceSvc.winningDistance, 'img_final_post', 'p0', 0.14, -18, 0, 0);

        // Draw race start
        this.drawCamImg(0, 'img_start_gate', 'g0', 0.20, 0, -110, 1);
        this.drawCamImg(0, 'img_start_gate', 'g1', 0.20, 12, -110, 3);
        this.drawCamImg(0, 'img_start_gate', 'g2', 0.20, 24, -110, 5);
        this.drawCamImg(0, 'img_start_gate', 'g3', 0.20, 36, -110, 10);

        // Draw race horses
        this.horsesList.getAll().forEach((h, index) => {
            if (h.position != null) {
                const hsl   = SLOT_COLOR_MAP[h.slot];
                const color = this.hslStringToPhaserColor(hsl, 25);
                this.drawCamPoint(h.position, color);

                const spriteSheetKey = `horseSpriteSheet${index}`;
                const instanceId     = `horse${index}`;
                const offsetY        = 18 + index * 10;
                const offsetX        = -90;
                const depth          = index * 2;
                const frameRate      = 18 + index;
                const idle           = this.raceState === 'pre';

                this.drawCamHorse(
                    h.position,
                    spriteSheetKey,
                    instanceId,
                    0.35,
                    offsetY,
                    offsetX,
                    depth,
                    frameRate,
                    idle
                );
            }
        });
    }

    // FUNCS TO DRAW RACE OBJECTS
    private drawCamCross(): void {
        const cam    = this.scene.cameras.main;
        const worldX = cam.worldView.x + cam.width * this.origin.x;
        const worldY = cam.worldView.y + cam.height * this.origin.y;
        const size   = 6;

        this.graphics.lineStyle(2, 0xffffff, this.getMarkerOpacity());
        this.graphics.beginPath();
        this.graphics.moveTo(worldX - size, worldY);
        this.graphics.lineTo(worldX + size, worldY);
        this.graphics.moveTo(worldX, worldY - size);
        this.graphics.lineTo(worldX, worldY + size);
        this.graphics.strokePath();
    }

    private drawCamPoint(pointPos: number, color: number = 0x00ff00): void {
        const cam     = this.scene.cameras.main;
        const worldX0 = cam.worldView.x + cam.width * this.origin.x;
        const worldY0 = cam.worldView.y + cam.height * this.origin.y;

        const deltaX = (pointPos - this.pos) * this.posToPx;
        const x      = worldX0 + deltaX;
        const y      = worldY0 + 118;

        this.graphics.fillStyle(color, this.getMarkerOpacity());
        this.graphics.fillRect(x, y, 2, 8);
    }

    private drawCamImg(
        pointPos: number,
        imgKey: string,
        instanceId: string = imgKey,
        scale = 0.5,
        offsetY = 0,
        offsetX = 0,
        depth = 1,
    ): void {
        const cam     = this.scene.cameras.main;
        const worldX0 = cam.worldView.x + cam.width * this.origin.x;
        const worldY0 = cam.worldView.y + cam.height * this.origin.y;
        const deltaX  = (pointPos - this.pos) * this.posToPx;
        const x       = worldX0 + deltaX + offsetX;
        const y       = worldY0 + offsetY;
        const key     = `img:${instanceId}`;
        let img       = this.images.get(key);

        if (!img) {
            img = this.scene.add.image(x, y, imgKey)
                .setScale(scale)
                .setDepth(depth);
            this.images.set(key, img);
        } else {
            img.setPosition(x, y).setDepth(depth);
        }
    }

    private drawCamHorse(
        pointPos: number,
        spriteSheetKey: string,
        instanceId: string,
        scale = 0.15,
        offsetY = 0,
        offsetX = 0,
        depth = 1,
        frameRate = 19,
        idle = false,
        shadowOffsetX = -15,
        shadowOffsetY = 70
    ): void {
        const finalSlideSpeed = 25; // pixels per second after cam stops
        const cam             = this.scene.cameras.main;
        const worldX0         = cam.worldView.x + cam.width * this.origin.x;
        const worldY0         = cam.worldView.y + cam.height * this.origin.y;

        const deltaX         = (pointPos - this.pos) * this.posToPx;
        const initialTargetX = worldX0 + deltaX + offsetX;
        const y              = worldY0 + offsetY;
        const key            = `sprite:${instanceId}`;
        let sprite           = this.sprites.get(key);
        const animKey        = `run:${spriteSheetKey}`;

        if (!this.scene.anims.exists(animKey)) {
            this.scene.anims.create({
                key: animKey,
                frames: this.scene.anims.generateFrameNumbers(spriteSheetKey),
                frameRate,
                repeat: -1
            });
        }

        if (!sprite) {
            // create sprite
            sprite = this.scene.add.sprite(initialTargetX, y, spriteSheetKey)
                .setScale(scale)
                .setDepth(depth);
            this.sprites.set(key, sprite);

            // create shadow ellipse with offsets
            const shadow = this.scene.add.ellipse(
                initialTargetX + shadowOffsetX,
                y + shadowOffsetY,
                sprite.displayWidth - 30,
                12,
                0x000000,
                0.4
            )
            .setScale(1, 0.5)
            .setDepth(depth - 0.5);
            this.shadows.set(key, shadow);

            if (!idle) {
                sprite.play(animKey);
            }
        } else {
            // update x position
            if (this.pos >= this.raceSvc.winningDistance) {
                sprite.x += finalSlideSpeed;
            } else {
                const dx = initialTargetX - sprite.x;
                sprite.x += Math.abs(dx) > 1 ? dx * 0.04 : 0;
                if (Math.abs(dx) <= 1) {
                    sprite.x = initialTargetX;
                }
            }

            sprite.setY(y).setDepth(depth);

            // update shadow with offsets
            const shadow = this.shadows.get(key)!;
            shadow.x = sprite.x + shadowOffsetX;
            shadow.y = y + shadowOffsetY;
            shadow.setDepth(depth - 0.5);

            if (idle) {
                if (sprite.anims.isPlaying) {
                    sprite.anims.stop();
                }
                sprite.setFrame(3);
            } else if (!sprite.anims.isPlaying) {
                sprite.play(animKey);
            }
        }
    }

    /** parse “hsl( … )” into a Phaser-friendly color integer */
    private hslStringToPhaserColor(hslStr: string, lightnessAdjust = 0): number {
        const match = /^hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)$/.exec(hslStr);
        if (!match) {
            return 0x000000;
        }
        const h = parseInt(match[1], 10) / 360;
        const s = parseInt(match[2], 10) / 100;
        let   l = parseInt(match[3], 10) / 100;
        l = Phaser.Math.Clamp(l + lightnessAdjust / 100, 0, 1);
        return Phaser.Display.Color.HSLToColor(h, s, l).color;
    }

    /** tear down subscription and graphics */
    destroy(): void {
        this.sub.unsubscribe();
        this.graphics.destroy();
        this.images.forEach(img => img.destroy());
        this.images.clear();
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites.clear();
        this.shadows.forEach(shadow => shadow.destroy());
        this.shadows.clear();
    }
}
