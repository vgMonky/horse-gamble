// src/app/components/phaser-canvas/game_visuals/sounds.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingRaceState
} from '@app/game/ongoing-race.service';

// default volumes (0.0–1.0)
const DEFAULT_VOLUMES = {
    shot:          0.3,
    ring:          0.4,
    horseGallop:   0.6,
    countdownTick: 0.09,
    trumpet:       1.0
};

// for phasing the 4 gallop loops
const BASE_GALLOP_RATE = 1.0;
const RATE_OFFSET     = 0.14;

export class SoundLayer {
    private stateSub?:        Subscription;
    private countdownSub?:    Subscription;
    private horseSounds:      Phaser.Sound.BaseSound[] = [];
    private currentState:     OngoingRaceState        = 'pre';

    constructor(
        private scene:   Phaser.Scene,
        private raceSvc: OngoingRaceService
    ) {
        this.scene.events.once('shutdown', () => this.destroy());
    }

    preload(): void {
        this.scene.load.audio('shot',          'assets/game-img/sound/shot.mp3');
        this.scene.load.audio('ring',          'assets/game-img/sound/ring.mp3');
        this.scene.load.audio('horseGallop',   'assets/game-img/sound/horse-gallop.mp3');
        this.scene.load.audio('countdownTick', 'assets/game-img/sound/beep.mp3');
        this.scene.load.audio('trumpet',       'assets/game-img/sound/trumpet.mp3');
    }

    create(): void {
        const shot      = this.scene.sound.add('shot', {
            volume: DEFAULT_VOLUMES.shot
        });
        const ring      = this.scene.sound.add('ring', {
            volume: DEFAULT_VOLUMES.ring
        });
        const tickSound = this.scene.sound.add('countdownTick', {
            volume: DEFAULT_VOLUMES.countdownTick
        });
        const trumpet   = this.scene.sound.add('trumpet', {
            volume: DEFAULT_VOLUMES.trumpet
        });

        // create 4 looping gallop sounds with phased rates and staggered volumes
        for (let i = 0; i < 4; i++) {
            const hs = this.scene.sound.add('horseGallop', {
                volume: DEFAULT_VOLUMES.horseGallop - 0.2 * i,
                loop:   true
            });
            hs.setRate(BASE_GALLOP_RATE + i * RATE_OFFSET);
            this.horseSounds.push(hs);
        }

        // keep track of the current race state
        this.stateSub = this.raceSvc.raceState$.subscribe((state: OngoingRaceState) => {
            this.currentState = state;

            if (state === 'in') {
                shot.play();
                ring.play();
                this.startHorseLoops();
                // you decide when to start all horses
            } else if (state === 'post') {
                ring.play();
                this.stopHorseLoops();
            } else {
                // pre
                trumpet.play();
            }
        });

        // only play tick during the PRE‐race countdown
        this.countdownSub = this.raceSvc.countdown$.subscribe(timeLeft => {
            if (this.currentState === 'pre' && timeLeft > 0 && timeLeft <= 5) {
                tickSound.play();
            }
        });
    }

    /** call this to start all gallop loops */
    public startHorseLoops(): void {
        this.horseSounds.forEach(hs => {
            if (!hs.isPlaying) {
                hs.play();
            }
        });
    }

    /** call this to stop all gallop loops */
    public stopHorseLoops(): void {
        this.horseSounds.forEach(hs => {
            if (hs.isPlaying) {
                hs.stop();
            }
        });
    }

    destroy(): void {
        this.stateSub?.unsubscribe();
        this.countdownSub?.unsubscribe();
    }
}
