import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

type OngoingRaceState = 'pre' | 'in' | 'post';

@Injectable({ providedIn: 'root' })
export class OngoingRaceService implements OnDestroy {
    private readonly tickSpeed = 400;
    private readonly winningDistance = 1000;
    private readonly countdownDuration = 10; // in seconds

    private raceInterval$!: Subscription;
    private countdownInterval$!: Subscription;

    private _horses = new BehaviorSubject<Horse[]>([]);
    private _winner = new BehaviorSubject<Horse | null>(null);
    private _podium = new BehaviorSubject<Horse[]>([]);
    private _finalPosition = new BehaviorSubject<number>(this.winningDistance);
    private _raceState = new BehaviorSubject<OngoingRaceState>('pre');
    private _countdown = new BehaviorSubject<number>(this.countdownDuration);

    horses$ = this._horses.asObservable();
    winner$ = this._winner.asObservable();
    podium$ = this._podium.asObservable();
    finalPosition$ = this._finalPosition.asObservable();
    raceState$ = this._raceState.asObservable();
    countdown$ = this._countdown.asObservable();

    startOngoingRace(horseCount: number = 4): void {
        this.stopOngoingRace(); // Ensure clean state

        const horses = Array.from({ length: horseCount }, (_, i) => new Horse(i + 1));
        this._horses.next(horses);
        this._winner.next(null);
        this._podium.next([]);
        this._raceState.next('pre');
        this._countdown.next(this.countdownDuration);

        this.countdownInterval$ = interval(1000).subscribe(() => {
            const remaining = this._countdown.getValue() - 1;
            this._countdown.next(remaining);

            if (remaining <= 0) {
                this.countdownInterval$.unsubscribe();
                this.beginInRace();
            }
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
        }
    }

    private stopRaceInterval(): void {
        this.raceInterval$?.unsubscribe();
    }

    private stopCountdownInterval(): void {
        this.countdownInterval$?.unsubscribe();
    }

    stopOngoingRace(): void {
        this.stopRaceInterval();
        this.stopCountdownInterval();
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
