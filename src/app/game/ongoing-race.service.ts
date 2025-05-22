// src/app/game/ongoing-race.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { ALL_HORSES, Horse } from './horses-database';

export const SLOT_COLOR_MAP: Record<number, string> = {
    0: 'hsl(0,70%,30%)', // RED
    1: 'hsl(90,70%,30%)', // GREEN
    2: 'hsl(180,70%,30%)', // CYAN
    3: 'hsl(300,70%,30%)' // MAGENTA
};

export type OngoingRaceState = 'pre' | 'in' | 'post';

export interface OngoingHorse {
    slot:        number;
    horse:       Horse;
    position:    number;
    finalPlace:  number | null;
}

export class OngoingHorsesList {
    private list: OngoingHorse[];

    constructor(allHorses: Horse[], count: number) {
        const selected = this.shuffle(allHorses).slice(0, count);
        this.list = selected.map((h, i) => ({
            slot:        i,
            horse:       h,
            position:    0,
            finalPlace:  null
        }));
    }

    private shuffle(arr: Horse[]): Horse[] {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    getAll(): OngoingHorse[] {
        return [...this.list];
    }

    /** sorted by finish place, then by descending position */
    getByPlacement(): OngoingHorse[] {
        return [...this.list].sort((a, b) => {
            if (a.finalPlace != null && b.finalPlace != null) {
                return a.finalPlace - b.finalPlace;
            } else if (a.finalPlace != null) {
                return -1;
            } else if (b.finalPlace != null) {
                return 1;
            } else {
                return (b.position! - a.position!);
            }
        });
    }

    /** apply the advances and mark any new finishers */
    applyAdvances(advances: number[], winningDistance: number): number {
        let finishCount = this.list.filter(h => h.finalPlace! > 0).length;

        // capture pre-tick positions for tie-breaking
        const prePositions = this.list.map(h => h.position!);

        this.list.forEach((h, i) => {
            h.position! += advances[i] || 0;
        });

        // compute final placement
            // primary sort: bigger overshoot wins
            // secondary sort: who was farther along before this tick
            // third sort: _list array order
        const newFinishers = this.list
            .filter(h => h.finalPlace == null && h.position! >= winningDistance)
            .sort((horseA, horseB) => {
                const overshootA = horseA.position! - winningDistance;
                const overshootB = horseB.position! - winningDistance;
                if (overshootB !== overshootA) {
                    return overshootB - overshootA;
                }

                const idxA = this.list.indexOf(horseA);
                const idxB = this.list.indexOf(horseB);
                const preA = prePositions[idxA];
                const preB = prePositions[idxB];
                return preB - preA;
            });

        // assign places in that order
        newFinishers.forEach(h => {
            h.finalPlace = ++finishCount;
        });

        return finishCount;
    }

    consoleLog(): void {
        console.log("")
        this.list.forEach(h => {
            console.log(
                `Horse ${h.horse.index} — ` +
                `pos: ${h.position ?? 'null'} — ` +
                `Place: ${h.finalPlace ?? 'null'}`
            );
        });
    }
}

@Injectable({ providedIn: 'root' })
export class OngoingRaceService implements OnDestroy {
    public readonly winningDistance       = 2000; // dm
    private readonly tickSpeed             = 100; // ms
    private readonly preCountdownDuration  = 20;
    private readonly postCountdownDuration = 10;

    private raceInterval$!: Subscription;
    private preTimer   = new CountdownTimer();
    private postTimer  = new CountdownTimer();

    private _horsesList        = new BehaviorSubject<OngoingHorsesList>(
        new OngoingHorsesList([], 0)
    );
    private _raceState     = new BehaviorSubject<OngoingRaceState>('pre');
    private _countdown     = new BehaviorSubject<number>(0);

    // Public streams
    horsesList$    = this._horsesList.asObservable();
    raceState$ = this._raceState.asObservable();
    countdown$ = this._countdown.asObservable();

    startOngoingRace(): void {
        this.stopOngoingRace();

        const horsesList = new OngoingHorsesList(ALL_HORSES, 4);
        this._horsesList.next(horsesList);
        this._raceState.next('pre');

        this.preTimer.start(
            this.preCountdownDuration,
            () => this.beginInRace(),
            this._countdown
        );
    }

    private beginInRace(): void {
        this._raceState.next('in');
        this.raceInterval$ = interval(this.tickSpeed).subscribe(() => {
            const list    = this._horsesList.getValue();
            const seed    = new Seed(4);
            const adv     = seed.splitNumber(list.getAll().length);
            const finished = list.applyAdvances(adv, this.winningDistance);

            this._horsesList.next(list);
            list.consoleLog();

            if (finished === list.getAll().length
            && this._raceState.getValue() === 'in'
            ) {
                this._raceState.next('post');
                this.postTimer.start(
                    this.postCountdownDuration,
                    () => {
                        this.stopRaceInterval();
                        this.startOngoingRace();
                    },
                    this._countdown
                );
            }
        });
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
    private readonly allowedDigits = [3, 4, 5, 6];

    constructor(length: number) {
        this.seedValue = this.genNumber(length);
    }

    private genNumber(length: number): number {
        let s = '';
        for (let i = 0; i < length; i++) {
            // pick a random index into allowedDigits
            const idx = Math.floor(Math.random() * this.allowedDigits.length);
            s += this.allowedDigits[idx];
        }
        return parseInt(s, 10);
    }

    splitNumber(parts: number): number[] {
        const digits    = this.seedValue.toString().split('');
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
