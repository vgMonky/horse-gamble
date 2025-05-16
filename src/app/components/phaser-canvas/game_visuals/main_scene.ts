// src/app/components/phaser-canvas/game_visuals/main_scene.ts
import Phaser from 'phaser';
import { ParallaxBackground } from './parallax_background';
import { Horses } from './horses_layers';
import { TextLayer } from './text_layer';
import type { OngoingRaceService } from '@app/game/ongoing-race.service';

export class MainScene extends Phaser.Scene {
    private bg!: ParallaxBackground;
    private horses!: Horses;
    private filterOverlay!: Phaser.GameObjects.Graphics;

    constructor(
        private ongoingRaceService: OngoingRaceService,
        private markerOpacityGetter: () => number,
        private filterLightnessGetter: () => number
    ) {
        super('MainScene');
    }

    preload(): void {
        this.bg = new ParallaxBackground(this, this.ongoingRaceService);
        this.bg.preload();

        this.horses = new Horses(
            this,
            this.ongoingRaceService,
            this.markerOpacityGetter
        );
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

        // parallax background
        this.bg.create();

        // filter overlay (color tint plane)
        const filter = {
            h: 0.1,
            s: 0.2,
            alpha: 0.2
        };
        const initialLightness = this.filterLightnessGetter();
        const filterColor = Phaser.Display.Color.HSLToColor(filter.h, filter.s, initialLightness).color;

        this.filterOverlay = this.add.graphics();
        this.filterOverlay.fillStyle(filterColor, filter.alpha);
        this.filterOverlay.fillRect(0, 0, width, height);
        this.filterOverlay.setScrollFactor(0);
        this.filterOverlay.setDepth(0);

        // countdown text layer
        const textLayer = new TextLayer(this, this.ongoingRaceService, 0.7);
        textLayer.create();

        // horses
        this.horses.create();
    }

    override update(time: number, delta: number): void {
        this.bg.update(time, delta);

        const light = Phaser.Math.Clamp(this.filterLightnessGetter(), 0, 0.5);
        const dynamicColor = Phaser.Display.Color.HSLToColor(0.1, 0.2, light).color;

        this.filterOverlay.clear();
        this.filterOverlay.fillStyle(dynamicColor, 0.2);
        this.filterOverlay.fillRect(0, 0, this.scale.width, this.scale.height);

        this.horses.update(time, delta);
    }
}
