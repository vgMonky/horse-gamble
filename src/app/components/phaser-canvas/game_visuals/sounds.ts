// src/app/components/phaser-canvas/game_visuals/sounds.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    HorseRaceState
} from '@app/game/horse-race.service';

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
    private stateSub?:     Subscription;
    private countdownSub?: Subscription;

    // keep references so we can destroy them
    private shot?    : Phaser.Sound.BaseSound;
    private ring?    : Phaser.Sound.BaseSound;
    private trumpet? : Phaser.Sound.BaseSound;
    private tickSound?: Phaser.Sound.BaseSound;
    private horseSounds: Phaser.Sound.BaseSound[] = [];

    private currentState: HorseRaceState = 'pre';

    constructor(
        private scene:   Phaser.Scene,
        private raceSvc: OngoingRaceService
    ) {
        // when the scene shuts down, fully clean up
        this.scene.events.once('shutdown', () => this.destroy());
        // also guard against the very last destroy event
        this.scene.events.once('destroy',  () => this.destroy());
    }

    preload(): void {
        this.scene.load.audio('shot',          'assets/game-img/sound/shot.mp3');
        this.scene.load.audio('ring',          'assets/game-img/sound/ring.mp3');
        this.scene.load.audio('horseGallop',   'assets/game-img/sound/horse-gallop.mp3');
        this.scene.load.audio('countdownTick', 'assets/game-img/sound/beep.mp3');
        this.scene.load.audio('trumpet',       'assets/game-img/sound/trumpet.mp3');
    }

    create(): void {
        // create and stash each sound
        this.shot      = this.scene.sound.add('shot',          { volume: DEFAULT_VOLUMES.shot });
        this.ring      = this.scene.sound.add('ring',          { volume: DEFAULT_VOLUMES.ring });
        this.trumpet   = this.scene.sound.add('trumpet',       { volume: DEFAULT_VOLUMES.trumpet });
        this.tickSound = this.scene.sound.add('countdownTick', { volume: DEFAULT_VOLUMES.countdownTick });

        // phased gallops
        for (let i = 0; i < 4; i++) {
            const hs = this.scene.sound.add('horseGallop', {
                volume: DEFAULT_VOLUMES.horseGallop - 0.2 * i,
                loop:   true
            });
            hs.setRate(BASE_GALLOP_RATE + i * RATE_OFFSET);
            this.horseSounds.push(hs);
        }

        // watch for race-state changes
        this.stateSub = this.raceSvc.raceState$.subscribe(state => {
            this.currentState = state;

            if (state === 'in') {
                this.safePlay(this.shot);
                this.safePlay(this.ring);
                this.startHorseLoops();
            }
            else if (state === 'post') {
                this.safePlay(this.ring);
                this.stopHorseLoops();
            }
            else {
                this.safePlay(this.trumpet);
            }
        });

        // watch for the countdown ticks
        this.countdownSub = this.raceSvc.countdown$.subscribe(timeLeft => {
            if (this.currentState === 'pre' && timeLeft > 0 && timeLeft <= 5) {
                this.safePlay(this.tickSound);
            }
        });
    }

    /** starts all gallop loops if not already playing */
    public startHorseLoops(): void {
        for (const hs of this.horseSounds) {
            if (!hs.isPlaying) {
                this.safePlay(hs);
            }
        }
    }

    /** stops all gallop loops if playing */
    public stopHorseLoops(): void {
        for (const hs of this.horseSounds) {
            if (hs.isPlaying) {
                hs.stop();
            }
        }
    }

    /** make sure we never call play() on a destroyed sound */
    private safePlay(sound?: Phaser.Sound.BaseSound) {
        try {
            sound?.play();
        } catch {
            // already destroyed or invalid — ignore
        }
    }

    /** fully clean up subscriptions and sounds */
    destroy(): void {
        this.stateSub?.unsubscribe();
        this.countdownSub?.unsubscribe();

        // stop & destroy every sound instance
        [ this.shot, this.ring, this.trumpet, this.tickSound, ...this.horseSounds ]
            .forEach(s => {
                if (!s) return;
                if (s.isPlaying) s.stop();
                s.destroy();
            });

        // clear the array so we don't hold onto any stale references
        this.horseSounds = [];
    }
}
