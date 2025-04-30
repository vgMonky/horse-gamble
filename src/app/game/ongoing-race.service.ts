import { Injectable, OnDestroy } from '@angular/core';
import {
    BehaviorSubject,
    interval,
    Subscription
} from 'rxjs';

export type OngoingRaceState = 'pre' | 'in' | 'post';

export interface Horse {
    index:    number;
    name:     string;
    position: number | null;
}

export interface Standing {
    horse:     Horse;
    placement: number;
}

@Injectable({ providedIn: 'root' })
export class OngoingRaceService implements OnDestroy {
    private readonly tickSpeed             = 400;
    private readonly winningDistance       = 5000;
    private readonly preCountdownDuration  = 3;
    private readonly postCountdownDuration = 3;

    private raceInterval$!: Subscription;
    private preTimer   = new CountdownTimer();
    private postTimer  = new CountdownTimer();

    private _horses        = new BehaviorSubject<Horse[]>([]);
    private _finalPosition = new BehaviorSubject<number>(this.winningDistance);
    private _raceState     = new BehaviorSubject<OngoingRaceState>('pre');
    private _countdown     = new BehaviorSubject<number>(0);
    private _podium        = new BehaviorSubject<Horse[]>([]); // PODIUM: ordered horses that have finished the race
    private _standings     = new BehaviorSubject<Standing[]>([]); // STANDINGS: ordered horses whether they’ve finished or not

    // Public streams
    horses$        = this._horses.asObservable();
    finalPosition$ = this._finalPosition.asObservable();
    raceState$     = this._raceState.asObservable();
    countdown$     = this._countdown.asObservable();
    podium$        = this._podium.asObservable();
    standings$     = this._standings.asObservable();

    startOngoingRace(): void {
        this.stopOngoingRace();

        const horseConfigs = [
            { index: 1,  name: 'Fast Fury'    },
            { index: 8,  name: 'Lucky Star'   },
            { index: 3,  name: 'Silver Arrow' },
            { index: 14, name: 'Night Rider'  },
        ];
        const horses: Horse[] = horseConfigs.map(c => ({
            index:    c.index,
            name:     c.name,
            position: 0
        }));

        this._horses.next(horses);
        this._podium.next([]);
        this._finalPosition.next(this.winningDistance);
        this._raceState.next('pre');
        this.updateStandings();

        this.preTimer.start(
            this.preCountdownDuration,
            () => this.beginInRace(),
            this._countdown
        );
    }

    private beginInRace(): void {
        this._raceState.next('in');
        this.raceInterval$ = interval(this.tickSpeed)
            .subscribe(() => this.runInRaceTick());
    }

    private runInRaceTick(): void {
        const horses = [...this._horses.getValue()];
        const podium = [...this._podium.getValue()];
        const seed    = new Seed(8);
        const advances= seed.splitNumber(horses.length);

        horses.forEach((h, i) => {
            if (h.position !== null && h.position < this.winningDistance) {
                h.position! += (advances[i] || 0);
                if (h.position! >= this.winningDistance && !podium.includes(h)) {
                    h.position = null;
                    podium.push(h);
                    console.log(`🎉 Horse ${h.index} finished!`);
                }
            }
        });

        this._horses.next(horses);
        this._podium.next(podium);
        this.updateStandings();

        if (podium.length === horses.length) {
            this._raceState.next('post');
            this.stopRaceInterval();
            this.postTimer.start(
                this.postCountdownDuration,
                () => this.startOngoingRace(),
                this._countdown
            );
        }
    }

    private updateStandings(): void {
        const all    = this._horses.getValue();
        const podium = this._podium.getValue();

        const finished: Standing[] = podium.map((h, i) => ({
            horse:     h,
            placement: i + 1
        }));

        const inRace: Standing[] = all
            .filter(h => h.position !== null && !podium.includes(h))
            .sort((a, b) => b.position! - a.position!)
            .map((h, i) => ({
                horse:     h,
                placement: podium.length + i + 1
            }));

        this._standings.next([...finished, ...inRace]);
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
        const digits   = this.seedValue.toString().split('');
        const chunkSize= Math.floor(digits.length / parts);
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
}

class CountdownTimer {
    private interval$!: Subscription;
    private _countdown = new BehaviorSubject<number>(0);

    get countdown$() {
        return this._countdown.asObservable();
    }

    start(
        seconds: number,
        onComplete: () => void,
        external?: BehaviorSubject<number>
    ): void {
        this._countdown.next(seconds);
        external?.next(seconds);
        this.interval$ = interval(1000).subscribe(() => {
            const next = this._countdown.getValue() - 1;
            this._countdown.next(next);
            external?.next(next);
            if (next <= 0) {
                this.interval$.unsubscribe();
                onComplete();
            }
        });
    }

    stop(): void {
        this.interval$?.unsubscribe();
    }
}
