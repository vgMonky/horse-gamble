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
    private posToPx = 15;
    private raceSvc: OngoingRaceService;
    private horsesList!: OngoingHorsesList;
    private sub: Subscription;
    private images: Map<string, Phaser.GameObjects.Image> = new Map();

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
            this.pos = first;
        }else {this.pos = this.raceSvc.winningDistance}

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
        this.drawCamImg(0, 'img_start_gate', 'g0', 0.20, 0, -110, 0);
        this.drawCamImg(0, 'img_start_gate', 'g1', 0.20, 12, -110, 2);
        this.drawCamImg(0, 'img_start_gate', 'g2', 0.20, 24, -110, 4);
        this.drawCamImg(0, 'img_start_gate', 'g3', 0.20, 36, -110, 6);
        this.drawCamPoint(0);

        //Draw point for each horse current pos
        this.horsesList.getAll().forEach(h => {
            if (h.position != null) this.drawCamPoint(h.position);
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

    /** tear down subscription and graphics */
    destroy(): void {
        this.sub.unsubscribe();
        this.graphics.destroy();
        this.images.forEach(img => img.destroy());
        this.images.clear();
    }
}
