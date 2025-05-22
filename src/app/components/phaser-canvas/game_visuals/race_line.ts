// src/app/components/phaser-canvas/game_visuals/race_line.ts
import Phaser from 'phaser';
import type {
    OngoingRaceService,
    OngoingHorsesList
} from '@app/game/ongoing-race.service';
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
    private sub: Subscription;
    private images: Map<string, Phaser.GameObjects.Image> = new Map();
    private sprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

    constructor(
        private scene: Phaser.Scene,
        raceSvc: OngoingRaceService,
        private getMarkerOpacity: () => number,
        origin?: { x: number; y: number }
    ) {
        this.raceSvc = raceSvc;
        this.origin = origin ?? { x: 0.5, y: 0.5 };
        this.graphics = this.scene.add.graphics();

        // subscribe to the live list
        this.sub = this.raceSvc.horsesList$.subscribe(list => {
            this.horsesList = list;
        });
    }

    updateCam(): void {
        // Set cam game position
        if (this.pos < this.raceSvc.winningDistance) {
            const first = this.horsesList.getByPlacement()[0].position;
            if (first < this.raceSvc.winningDistance) {
                this.pos = first;
            }else {this.pos = this.raceSvc.winningDistance}
        }

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
        this.drawCamPoint(this.raceSvc.winningDistance);

        // Draw race start
        this.drawCamImg(0, 'img_start_gate', 'g0', 0.20, 0, -110, 1);
        this.drawCamImg(0, 'img_start_gate', 'g1', 0.20, 12, -110, 3);
        this.drawCamImg(0, 'img_start_gate', 'g2', 0.20, 24, -110, 5);
        this.drawCamImg(0, 'img_start_gate', 'g3', 0.20, 36, -110, 10);
        this.drawCamPoint(0);

        // Draw race horses
        this.horsesList.getAll().forEach((h, index) => {
            if (h.position != null) {
                this.drawCamPoint(h.position);

                const spriteSheetKey = `horseSpriteSheet${index}`;
                const instanceId = `horse${index}`;
                const offsetY = 18 + index * 10; // stack them vertically
                const offsetX = -90;
                const depth = index * 2;

                this.drawCamHorse(h.position, spriteSheetKey, instanceId, 0.35, offsetY, offsetX, depth, 18 + index);
            }
        });
    }

    private drawCamCross(): void {
        const cam = this.scene.cameras.main;
        const worldX = cam.worldView.x + cam.width * this.origin.x;
        const worldY = cam.worldView.y + cam.height * this.origin.y;
        const size = 6;

        this.graphics.lineStyle(2, 0xffffff, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(worldX - size, worldY);
        this.graphics.lineTo(worldX + size, worldY);
        this.graphics.moveTo(worldX, worldY - size);
        this.graphics.lineTo(worldX, worldY + size);
        this.graphics.strokePath();
    }

    private drawCamPoint(pointPos: number): void {
        const cam = this.scene.cameras.main;
        const worldX0 = cam.worldView.x + cam.width * this.origin.x;
        const worldY0 = cam.worldView.y + cam.height * this.origin.y;

        const deltaX = (pointPos - this.pos) * this.posToPx;
        const x = worldX0 + deltaX;
        const y = worldY0;
        const radius = 4;

        this.graphics.fillStyle(0x00ff00, this.getMarkerOpacity());
        this.graphics.fillCircle(x, y, radius);
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
        const cam = this.scene.cameras.main;
        const worldX0 = cam.worldView.x + cam.width * this.origin.x;
        const worldY0 = cam.worldView.y + cam.height * this.origin.y;
        const deltaX = (pointPos - this.pos) * this.posToPx;
        const x = worldX0 + deltaX + offsetX;
        const y = worldY0 + offsetY;
        const key = `img:${instanceId}`;
        let img = this.images.get(key);
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
        slideVelMultiplier = 0.04
    ): void {
        const cam = this.scene.cameras.main;
        const worldX0 = cam.worldView.x + cam.width * this.origin.x;
        const worldY0 = cam.worldView.y + cam.height * this.origin.y;
        const deltaX = (pointPos - this.pos) * this.posToPx;
        const targetX = worldX0 + deltaX + offsetX;
        const y = worldY0 + offsetY;

        const key = `sprite:${instanceId}`;
        let sprite = this.sprites.get(key);

        if (!sprite) {
            const animKey = `run:${spriteSheetKey}`;
            if (!this.scene.anims.exists(animKey)) {
                this.scene.anims.create({
                    key: animKey,
                    frames: this.scene.anims.generateFrameNumbers(spriteSheetKey, {}),
                    frameRate,
                    repeat: -1
                });
            }

            sprite = this.scene.add.sprite(targetX, y, spriteSheetKey)
                .setScale(scale)
                .setDepth(depth)
                .play(animKey);

            this.sprites.set(key, sprite);
        } else {
            const currentX = sprite.x;
            const dx = targetX - currentX;

            if (Math.abs(dx) > 1) {
                const slideStep = dx * slideVelMultiplier;
                sprite.x += slideStep;
            } else {
                sprite.x = targetX; // snap to final if close enough
            }

            sprite.setY(y).setDepth(depth);
        }
    }

    /** tear down subscription and graphics */
    destroy(): void {
        this.sub.unsubscribe();
        this.graphics.destroy();
        this.images.forEach(img => img.destroy());
        this.images.clear();
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites.clear();
    }
}
