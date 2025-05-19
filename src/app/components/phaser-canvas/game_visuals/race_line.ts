// src/app/components/phaser-canvas/game_visuals/race_line.ts
import Phaser from 'phaser';
import type {
    OngoingRaceService,
    OngoingHorse,
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
        this.cam = new Camera(this.scene, this.ongoingRaceService);
    }

    preload(): void {
    }

    create(): void {
        // initial draw
        this.cam.updateCam();
    }

    update(time: number, delta: number): void {
        this.cam.updateCam();
    }
}

class Camera {
    public pos: number = 0;
    public origin: { x: number; y: number };
    private graphics: Phaser.GameObjects.Graphics;
    private posToPx: number = 10;
    private raceSvc: OngoingRaceService;
    private horsesList!: OngoingHorsesList;
    private sub: Subscription;

    constructor(
        private scene: Phaser.Scene,
        raceSvc: OngoingRaceService,
        origin?: { x: number; y: number }
    ) {
        this.raceSvc = raceSvc;
        // subscribe to the OngoingHorsesList directly
        this.sub = this.raceSvc.horsesList$.subscribe(list => {
            this.horsesList = list;
        });
        // default origin to center of viewport
        this.origin = origin ?? { x: 0.5, y: 0.5 };
        this.graphics = this.scene.add.graphics();
    }

    // Recompute camera‐related state, then redraw everything.
    updateCam(): void {
        if (this.pos < this.raceSvc.winningDistance) {
            let firstPlacePos = this.horsesList.getByPlacement()[0].position
            this.pos = firstPlacePos;
        }
        this.drawView();
    }

    // DRAW FUNCS:
    private drawView(): void {
        this.graphics.clear();

        this.drawCamCross();
        this.drawCamPoint(0); // draw starting point
        this.drawCamPoint(this.raceSvc.winningDistance); // draw final point
        // draw a point for each horse pos
        this.horsesList.getAll().forEach(h => {
            if (h.position != null) {
                this.drawCamPoint(h.position);
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
        // horizontal
        this.graphics.moveTo(worldX - size, worldY);
        this.graphics.lineTo(worldX + size, worldY);
        // vertical
        this.graphics.moveTo(worldX, worldY - size);
        this.graphics.lineTo(worldX, worldY + size);
        this.graphics.strokePath();
    }

    private drawCamPoint(pointPos: number): void {
        const cam = this.scene.cameras.main;
        // compute world‐space origin
        const worldX0 = cam.worldView.x + cam.width * this.origin.x;
        const worldY0 = cam.worldView.y + cam.height * this.origin.y;

        // convert logical delta to pixels
        const deltaPos = pointPos - this.pos;
        const deltaX = deltaPos * this.posToPx;

        const x = worldX0 + deltaX;
        const y = worldY0;
        const radius = 4;

        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillCircle(x, y, radius);
    }
}
