// src/app/components/phaser-canvas/game_visuals/main_scene.ts
import Phaser from 'phaser';
import { ParallaxBackground } from './parallax_background';
import { SkyBackground } from './sky_background';
import { FilterScreen } from './filter_screen';
import { TextLayer } from './text_layer';
import type { OngoingRaceService } from '@app/game/ongoing-race.service';

export class MainScene extends Phaser.Scene {
    private sky!: SkyBackground;
    private bg!: ParallaxBackground;
    private filterScreen!: FilterScreen;

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
    }

    create(): void {
        // sky gradient
        this.sky = new SkyBackground(this);
        this.sky.create();

        // parallax background
        this.bg.create();

        // filter overlay
        this.filterScreen = new FilterScreen(this, this.filterLightnessGetter);
        this.filterScreen.create();

        // race line

        // countdown text
        const textLayer = new TextLayer(this, this.ongoingRaceService, 0.7);
        textLayer.create();
    }

    override update(time: number, delta: number): void {
        this.bg.update(time, delta);
        this.filterScreen.update(time, delta);
    }
}
