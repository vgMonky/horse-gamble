import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OngoingRaceService implements OnDestroy {
    private readonly tickSpeed = 400;
    private readonly winningDistance = 1000;
    private raceInterval$!: Subscription;

    private _horses = new BehaviorSubject<Horse[]>([]);
    private _winner = new BehaviorSubject<Horse | null>(null);
    private _podium = new BehaviorSubject<Horse[]>([]);
    private _finalPosition = new BehaviorSubject<number>(this.winningDistance);
    private raceFinished = false;

    horses$ = this._horses.asObservable();
    winner$ = this._winner.asObservable();
    podium$ = this._podium.asObservable();
    finalPosition$ = this._finalPosition.asObservable();

    startRace(horseCount: number = 4): void {
        const horses = Array.from({ length: horseCount }, (_, i) => new Horse(i + 1));
        this._horses.next(horses);
        this._winner.next(null);
        this._podium.next([]);
        this.raceFinished = false;

        this.raceInterval$ = interval(this.tickSpeed).subscribe(() => this.runRaceTick());
    }

    restartRace(horseCount: number = 4): void {
        this.stopRace();
        this.startRace(horseCount);
    }

    private runRaceTick(): void {
        const horses = [...this._horses.getValue()];
        const podium = [...this._podium.getValue()];
        const seed = new Seed(8);
        const advances = seed.splitNumber(horses.length);

        horses.forEach((horse, i) => {
            if (horse.position < this.winningDistance) {
                const amount = advances[i] || 0;
                horse.advance(amount);

                // If horse now crosses finish line, add to podium if not already there
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

        // First horse that finished is considered the winner
        if (!this._winner.getValue() && podium.length > 0) {
            this._winner.next(podium[0]);
            console.log(`🏁 Horse ${podium[0].index} is the winner!`);
        }

        // All horses finished?
        if (podium.length === horses.length) {
            console.log(`✅ All horses finished! Final podium:`);
            podium.forEach((horse, place) => {
                console.log(`${place + 1}º place: Horse ${horse.index} (${horse.position})`);
            });

            this.raceFinished = true;
            this.stopRace();
        }
    }

    stopRace(): void {
        this.raceInterval$?.unsubscribe();
    }

    ngOnDestroy(): void {
        this.stopRace();
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
