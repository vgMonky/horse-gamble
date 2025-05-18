// src/app/components/phaser-canvas/game_visuals/race_line.ts
import Phaser from 'phaser';
import type { OngoingRaceService } from '@app/game/ongoing-race.service';

export class RaceLineLayer {
    private graphics!: Phaser.GameObjects.Graphics;
    private camOriginX: number = 0;
    private camOriginY: number = 0;

    constructor(
        private scene: Phaser.Scene,
        private ongoingRaceService: OngoingRaceService,
        private getMarkerOpacity: () => number
    ) {}

    preload(): void {
        // nothing to preload here
    }

    create(): void {
        // create a graphics object for drawing the cross
        this.graphics = this.scene.add.graphics();
        // initial calculation and draw
        this.updateCamOrigin();
        this.drawCamCross();
    }

    update(time: number, delta: number): void {
        // recalculate and redraw each frame (in case camera moves)
        this.updateCamOrigin();
        this.drawCamCross();
    }

    /** calculate the world coordinates of the camera's origin */
    private updateCamOrigin(): void {
        const cam = this.scene.cameras.main;
        // worldView.x/y is the top-left corner of the camera's viewport in world coords
        // originX/Y are normalized (0–1) offsets within the viewport (default 0.5, 0.5 for center)
        this.camOriginX = cam.worldView.x + cam.width * cam.originX;
        this.camOriginY = cam.worldView.y + cam.height * cam.originY;
    }

    /** draw a small cross at the camera origin */
    private drawCamCross(): void {
        const size = 10;
        const alpha = this.getMarkerOpacity();
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xffffff, alpha);
        this.graphics.beginPath();
        // horizontal line
        this.graphics.moveTo(this.camOriginX - size, this.camOriginY);
        this.graphics.lineTo(this.camOriginX + size, this.camOriginY);
        // vertical line
        this.graphics.moveTo(this.camOriginX, this.camOriginY - size);
        this.graphics.lineTo(this.camOriginX, this.camOriginY + size);
        this.graphics.strokePath();
    }
}
