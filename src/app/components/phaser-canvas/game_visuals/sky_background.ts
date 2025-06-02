// src/app/components/phaser-canvas/game_visuals/sky_background.ts
import Phaser from 'phaser';

export class SkyBackground {
    constructor(private scene: Phaser.Scene) {}

    create(): void {
        const { width, height } = this.scene.scale;
        const g = this.scene.add.graphics();

        const topColor  = Phaser.Display.Color.HSLToColor(0.6, 0.2, 0.6).color;
        const topColor2 = Phaser.Display.Color.HSLToColor(0.99, 0.2, 0.7).color;
        const bottom    = Phaser.Display.Color.HSLToColor(0.5, 0.2, 0.9).color;

        g.fillGradientStyle(topColor2, topColor, bottom, bottom, 1);
        g.fillRect(-100, 0, width + 100, height);
        g.setDepth(-10);
    }
}
