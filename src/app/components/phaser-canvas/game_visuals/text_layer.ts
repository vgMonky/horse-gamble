// src/app/components/phaser-canvas/game_visuals/text_layer.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type { OngoingRaceService, OngoingRaceState } from '@app/game/ongoing-race.service';

export class TextLayer {
    private overlay!: Phaser.GameObjects.Graphics;
    private countdownText!: Phaser.GameObjects.Text;
    private stateSub?: Subscription;
    private countdownSub?: Subscription;

    /**
     * @param scene Your Phaser.Scene instance
     * @param raceSvc The OngoingRaceService to subscribe to
     * @param opacity Overlay opacity (0 = transparent, 1 = solid black)
     */
    constructor(
        private scene: Phaser.Scene,
        private raceSvc: OngoingRaceService,
        private opacity: number = 0.5
    ) {}

    /** Call in your scene’s create() */
    create(): void {
        const { width, height } = this.scene.scale;

        // 1) black overlay
        this.overlay = this.scene.add.graphics()
            .fillStyle(0x000000, this.opacity)
            .fillRect(0, 0, width, height)
            .setScrollFactor(0)
            .setDepth(100);

        // 2) countdown text
        this.countdownText = this.scene.add.text(width / 2, height / 2, '', {
            font: '48px Arial',
            color: '#ffffff',
            align: 'center'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);

        // show/hide based on race state
        this.stateSub = this.raceSvc.raceState$.subscribe((state: OngoingRaceState) => {
            const visible = (state === 'pre' || state === 'post');
            this.overlay.setVisible(visible);
            this.countdownText.setVisible(visible);
        });

        // update countdown text
        this.countdownSub = this.raceSvc.countdown$.subscribe(count => {
            this.countdownText.setText(count.toString());
        });
    }

    /** Clean up when the scene shuts down */
    destroy(): void {
        this.stateSub?.unsubscribe();
        this.countdownSub?.unsubscribe();
        this.overlay.destroy();
        this.countdownText.destroy();
    }
}
