import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RaceService implements OnDestroy {
    private readonly tickSpeed = 600;
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
        if (this.raceFinished) return;

        const horses = [...this._horses.getValue()];
        const seed = new Seed(8);
        const advances = seed.splitNumber(horses.length);

        horses.forEach((horse, i) => {
            const amount = advances[i] || 0;
            horse.advance(amount);
        });

        this._horses.next(horses);
        console.log('Seed value:', seed.value);
        console.log('Advance values:', advances);
        console.log('Horse positions:', horses.map(h => h.position));

        const winner = horses.find(h => h.position >= this.winningDistance);
        if (winner) {
            this.raceFinished = true;
            this._winner.next(winner);

            const podium = [...horses].sort((a, b) => b.position - a.position);
            this._podium.next(podium);
            console.log(`🏁 Horse ${winner.index} wins the race!`);

            podium.forEach((horse, place) => {
                console.log(`${place + 1}º place: Horse ${horse.index} (${horse.position})`);
            });

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
