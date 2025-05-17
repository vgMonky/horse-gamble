// src/app/components/phaser-canvas/game_visuals/race_line.ts
import Phaser from 'phaser';
import type { OngoingRaceService } from '@app/game/ongoing-race.service';

export class RaceLineLayer {
    constructor(
        private scene: Phaser.Scene,
        private ongoingRaceService: OngoingRaceService,
        private getMarkerOpacity: () => number
    ) {}

    preload(): void {
        // TODO: load race-line assets
    }

    create(): void {
        // TODO: initialize race line elements
    }

    update(time: number, delta: number): void {
        // TODO: update race line each frame
    }
}
