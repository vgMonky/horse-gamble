// src/app/components/phaser-canvas/game_visuals/filter_screen.ts
import Phaser from 'phaser';

export class FilterScreen {
    private overlay!: Phaser.GameObjects.Graphics;
    private readonly config = { h: 0.1, s: 0.2, alpha: 0.2 };

    constructor(
        private scene: Phaser.Scene,
        private getLightness: () => number
    ) {}

    create(): void {
        const { width, height } = this.scene.scale;
        const initial = this.getLightness();
        const color = Phaser.Display.Color.HSLToColor(
            this.config.h,
            this.config.s,
            initial
        ).color;

        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(color, this.config.alpha);
        this.overlay.fillRect(0, 0, width, height);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(0);
    }

    update(time: number, delta: number): void {
        const { width, height } = this.scene.scale;
        const light = Phaser.Math.Clamp(this.getLightness(), 0, 0.5);
        const dynamic = Phaser.Display.Color.HSLToColor(
            this.config.h,
            this.config.s,
            light
        ).color;

        this.overlay.clear();
        this.overlay.fillStyle(dynamic, this.config.alpha);
        this.overlay.fillRect(0, 0, width, height);
    }
}
