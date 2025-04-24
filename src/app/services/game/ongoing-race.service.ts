import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

type OngoingRaceState = 'pre' | 'in' | 'post';

@Injectable({ providedIn: 'root' })
export class OngoingRaceService implements OnDestroy {
    private readonly tickSpeed = 400;
    private readonly winningDistance = 1000;
    private readonly preCountdownDuration = 3;
    private readonly postCountdownDuration = 3;

    private raceInterval$!: Subscription;
    private preTimer = new CountdownTimer();
    private postTimer = new CountdownTimer();

    private _horses = new BehaviorSubject<Horse[]>([]);
    private _winner = new BehaviorSubject<Horse | null>(null);
    private _podium = new BehaviorSubject<Horse[]>([]);
    private _finalPosition = new BehaviorSubject<number>(this.winningDistance);
    private _raceState = new BehaviorSubject<OngoingRaceState>('pre');
    private _countdown = new BehaviorSubject<number>(0);

    horses$ = this._horses.asObservable();
    winner$ = this._winner.asObservable();
    podium$ = this._podium.asObservable();
    finalPosition$ = this._finalPosition.asObservable();
    raceState$ = this._raceState.asObservable();
    countdown$ = this._countdown.asObservable();

    startOngoingRace(): void {
        this.stopOngoingRace();

        // ← define your horses here:
        const horseConfigs = [
            { index: 1,  name: 'Fast Fury'    },
            { index: 8,  name: 'Lucky Star'   },
            { index: 3,  name: 'Silver Arrow' },
            { index: 14, name: 'Night Rider'  },
        ];

        // ← create them with names
        const horses = horseConfigs.map(cfg =>
            new Horse(cfg.index, cfg.name)
        );
        this._horses.next(horses);
        this._winner.next(null);
        this._podium.next([]);
        this._raceState.next('pre');

        this.preTimer.start(this.preCountdownDuration, () => {
            this.beginInRace();
        }, this._countdown);
    }


    restartOngoingRace(): void {
        this.startOngoingRace();
    }

    private beginInRace(): void {
        this._raceState.next('in');
        this.raceInterval$ = interval(this.tickSpeed)
            .subscribe(() => this.runInRaceTick());
    }

    private runInRaceTick(): void {
        const horses = [...this._horses.getValue()];
        const podium = [...this._podium.getValue()];
        const seed = new Seed(8);
        const advances = seed.splitNumber(horses.length);

        horses.forEach((horse, i) => {
            // only advance if still racing
            if (horse.position !== null && horse.position < this.winningDistance) {
                horse.advance(advances[i] || 0);
                // mark finished
                if (horse.position! >= this.winningDistance && !podium.includes(horse)) {
                    horse.placement = podium.length + 1;
                    podium.push(horse);
                    horse.position = null;
                    console.log(`🎉 Horse ${horse.index} finished!`);
                }
            }
        });

        this._horses.next(horses);
        this._podium.next(podium);

        // first finisher = winner
        if (!this._winner.getValue() && podium.length > 0) {
            this._winner.next(podium[0]);
            console.log(`🏁 Horse ${podium[0].index} is the winner!`);
        }

        // all done?
        if (podium.length === horses.length) {
            this._raceState.next('post');
            this.stopRaceInterval();
            this.postTimer.start(this.postCountdownDuration, () => {
                this.restartOngoingRace();
            }, this._countdown);
        }
    }

    private stopRaceInterval(): void {
        this.raceInterval$?.unsubscribe();
    }

    stopOngoingRace(): void {
        this.stopRaceInterval();
        this.preTimer.stop();
        this.postTimer.stop();
    }

    ngOnDestroy(): void {
        this.stopOngoingRace();
    }
}

// src/app/services/game/ongoing-race.service.ts
class Horse {
    constructor(
        public index: number,
        public name: string,
        public position: number | null = 0,
        public placement?: number     // 1 for 1st, 2 for 2nd, etc.
    ) {}
    advance(amount: number) {
        if (this.position !== null) {
            this.position += amount;
        }
    }
}

class Seed {
    private seedValue: number;
    constructor(length: number) {
        this.seedValue = this.genNumber(length);
    }
    private genNumber(length: number): number {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    splitNumber(parts: number): number[] {
        const digits = this.seedValue.toString().split('');
        const chunkSize = Math.floor(digits.length / parts);
        if (!chunkSize) return [];
        const result: number[] = [];
        for (let i = 0; i < parts; i++) {
            const chunk = digits.slice(i * chunkSize, (i + 1) * chunkSize);
            if (chunk.length === chunkSize) {
                result.push(+chunk.join(''));
            }
        }
        return result;
    }
    get value(): number {
        return this.seedValue;
    }
}

class CountdownTimer {
    private interval$!: Subscription;
    private _countdown = new BehaviorSubject<number>(0);
    get countdown$() {
        return this._countdown.asObservable();
    }
    start(seconds: number, onComplete: () => void, external?: BehaviorSubject<number>): void {
        this._countdown.next(seconds);
        external?.next(seconds);
        this.interval$ = interval(1000).subscribe(() => {
            const next = this._countdown.getValue() - 1;
            this._countdown.next(next);
            external?.next(next);
            if (next <= 0) {
                this.stop();
                onComplete();
            }
        });
    }
    stop(): void {
        this.interval$?.unsubscribe();
    }
}
