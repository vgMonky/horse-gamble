import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

type OngoingRaceState = 'pre' | 'in' | 'post';

@Injectable({ providedIn: 'root' })
export class OngoingRaceService implements OnDestroy {
    private readonly tickSpeed = 400;
    private readonly winningDistance = 1000;
    private readonly preCountdownDuration = 10;
    private readonly postCountdownDuration = 10;

    private raceInterval$!: Subscription;
    private preTimer = new CountdownTimer();
    private postTimer = new CountdownTimer();

    private _horses = new BehaviorSubject<Horse[]>([]);
    private _winner = new BehaviorSubject<Horse | null>(null);
    private _podium = new BehaviorSubject<Horse[]>([]);
    private _finalPosition = new BehaviorSubject<number>(this.winningDistance);
    private _raceState = new BehaviorSubject<OngoingRaceState>('pre');

    horses$ = this._horses.asObservable();
    winner$ = this._winner.asObservable();
    podium$ = this._podium.asObservable();
    finalPosition$ = this._finalPosition.asObservable();
    raceState$ = this._raceState.asObservable();

    // Expose countdown based on current state
    get countdown$() {
        return this._raceState.getValue() === 'post'
            ? this.postTimer.countdown$
            : this.preTimer.countdown$;
    }

    startOngoingRace(horseCount: number = 4): void {
        this.stopOngoingRace();

        const horses = Array.from({ length: horseCount }, (_, i) => new Horse(i + 1));
        this._horses.next(horses);
        this._winner.next(null);
        this._podium.next([]);
        this._raceState.next('pre');

        this.preTimer.start(this.preCountdownDuration, () => {
            this.beginInRace();
        });
    }

    restartOngoingRace(horseCount: number = 4): void {
        this.startOngoingRace(horseCount);
    }

    private beginInRace(): void {
        this._raceState.next('in');

        this.raceInterval$ = interval(this.tickSpeed).subscribe(() => this.runInRaceTick());
    }

    private runInRaceTick(): void {
        const horses = [...this._horses.getValue()];
        const podium = [...this._podium.getValue()];
        const seed = new Seed(8);
        const advances = seed.splitNumber(horses.length);

        horses.forEach((horse, i) => {
            if (horse.position < this.winningDistance) {
                const amount = advances[i] || 0;
                horse.advance(amount);

                if (horse.position >= this.winningDistance && !podium.includes(horse)) {
                    podium.push(horse);
                    console.log(`🎉 Horse ${horse.index} finished!`);
                }
            }
        });

        this._horses.next(horses);
        this._podium.next(podium);
        console.log('Seed value:', seed.value);
        console.log('Advance values:', advances);
        console.log('Horse positions:', horses.map(h => h.position));

        if (!this._winner.getValue() && podium.length > 0) {
            this._winner.next(podium[0]);
            console.log(`🏁 Horse ${podium[0].index} is the winner!`);
        }

        if (podium.length === horses.length) {
            console.log(`✅ All horses finished! Final podium:`);
            podium.forEach((horse, place) => {
                console.log(`${place + 1}º place: Horse ${horse.index} (${horse.position})`);
            });

            this._raceState.next('post');
            this.stopRaceInterval();

            this.postTimer.start(this.postCountdownDuration, () => {
                this.restartOngoingRace();
            });
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

class Horse {
    constructor(public index: number, public position: number = 0) {}

    advance(amount: number) {
        this.position += amount;
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
        if (chunkSize === 0) return [];

        const result: number[] = [];
        for (let i = 0; i < parts; i++) {
            const chunk = digits.slice(i * chunkSize, (i + 1) * chunkSize);
            if (chunk.length === chunkSize) {
                result.push(parseInt(chunk.join(''), 10));
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

    start(seconds: number, onComplete: () => void): void {
        this._countdown.next(seconds);

        this.interval$ = interval(1000).subscribe(() => {
            const next = this._countdown.getValue() - 1;
            this._countdown.next(next);

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
