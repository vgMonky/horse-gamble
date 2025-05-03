// src/app/components/phaser-canvas/game_visuals/main_scene.ts
import Phaser from 'phaser';
import { ParallaxBackground } from './parallax_background';
import { Horses } from './horses_layers';
import type { OngoingRaceService } from '@app/game/ongoing-race.service';

export class MainScene extends Phaser.Scene {
    private bg!: ParallaxBackground;
    private horses!: Horses;

    constructor(private race: OngoingRaceService) {
        super('MainScene');
    }

    preload(): void {
        // 1️⃣ background assets
        this.bg = new ParallaxBackground(this);
        this.bg.preload();

        // 2️⃣ horses
        this.horses = new Horses(this, this.race.horses$);
        this.horses.preload();
    }

    create(): void {
        const { width, height } = this.scale;

        // sky gradient
        const g = this.add.graphics();
        const topColor    = Phaser.Display.Color.HSLToColor(0.6, 0.2, 0.6).color;
        const topColor2   = Phaser.Display.Color.HSLToColor(0.99, 0.2, 0.7).color;
        const bottomColor = Phaser.Display.Color.HSLToColor(0.5, 0.2, 0.9).color;
        g.fillGradientStyle(topColor2, topColor, bottomColor, bottomColor, 1);
        g.fillRect(-100, 0, width + 100, height);
        g.setDepth(-10);

        // parallax
        this.bg.create();

        // horses
        this.horses.create();
    }

    override update(time: number, delta: number): void {
        this.bg.update(time, delta);
        this.horses.update(time, delta);
    }
}
