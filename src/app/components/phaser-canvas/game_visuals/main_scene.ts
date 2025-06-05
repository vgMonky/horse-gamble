// src/app/components/phaser-canvas/game_visuals/main_scene.ts
import Phaser from 'phaser';
import { ParallaxBackground } from './parallax_background';
import { SkyBackground } from './sky_background';
import { FilterScreen } from './filter_screen';
import { TextLayer } from './text_layer';
import { RaceLineLayer } from './race_line';
import { SoundLayer } from './sounds';
import { MiniMapLayer } from './mini_map';
import type { OngoingRaceService } from '@app/game/ongoing-race.service';

export class MainScene extends Phaser.Scene {
    private sky!: SkyBackground;
    private bg!: ParallaxBackground;
    private filterScreen!: FilterScreen;
    private raceLine!: RaceLineLayer;
    private miniMap!: MiniMapLayer;
    private soundLayer!: SoundLayer;

    constructor(
        private ongoingRaceService: OngoingRaceService,
        private markerOpacityGetter: () => number,
        private filterLightnessGetter: () => number,
        private muteGetter: () => boolean
    ) {
        super('MainScene');
    }

    preload(): void {
        this.bg = new ParallaxBackground(this, this.ongoingRaceService);
        this.bg.preload();

        this.raceLine = new RaceLineLayer(this, this.ongoingRaceService, this.markerOpacityGetter);
        this.raceLine.preload();

        this.soundLayer = new SoundLayer(this, this.ongoingRaceService);
        this.soundLayer.preload();
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

        // top-right minimap of the circuit
        this.miniMap = new MiniMapLayer(
            this,
            this.ongoingRaceService,
            this.markerOpacityGetter
        );
        this.miniMap.create();

        // race line (gates, finish post, camera setup, horses, etc.)
        this.raceLine.create();

        // countdown text
        const textLayer = new TextLayer(this, this.ongoingRaceService, 0.7);
        textLayer.create();

        this.soundLayer.create();
    }

    override update(time: number, delta: number): void {
        this.sound.mute = this.muteGetter();
        this.bg.update(time, delta);
        this.filterScreen.update(time, delta);
        this.miniMap.update();
        this.raceLine.update(time, delta);
    }
}
