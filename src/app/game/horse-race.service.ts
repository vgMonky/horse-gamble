// src/app/game/horse-race.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { ALL_HORSES, Horse } from './horses-database';
import {
    HorseRace,
    RaceHorsesList,
    HorseRaceState
} from './horse-race.abstract';
import {
    BehaviorSubject,
    Observable,
    switchMap,
    filter,
    takeUntil,
    Subject
} from 'rxjs';

/**
 * Manages any number of HorseRace instances in a simple array.
 */
class RaceManager {
    private races: HorseRace[] = [];

    constructor(
        private allHorses: Horse[],
        private runnerCount: number,
        private tickMs: number,
        private postSec: number,
        private winningDistanceDm: number
    ) {}

    /**
     * Create & register a new HorseRace with its own `id`, and start it automatically.
     */
    createRace(id: number, preSec: number): HorseRace {
        if (this.races.find(r => r.id === id)) {
            throw new Error(`Race ${id} already exists`);
        }
        const race = new HorseRace(
            id,
            this.allHorses,
            this.runnerCount,
            this.tickMs,
            preSec,
            this.postSec,
            this.winningDistanceDm
        );
        this.races.push(race);
        race.startRace()
        return race;
    }

    stopRace(id: number): void {
        this.getHorseRaceById(id).stopRace();
    }

    getRaceState$(id: number): Observable<HorseRaceState> {
        return this.getHorseRaceById(id).raceState$;
    }
    getCountdown$(id: number): Observable<number> {
        return this.getHorseRaceById(id).countdown$;
    }
    getHorsesList$(id: number): Observable<RaceHorsesList> {
        return this.getHorseRaceById(id).horsesList$;
    }
    getWinningDistance(id: number): number {
        return this.getHorseRaceById(id).winningDistance;
    }
    getID(id: number): number {
        return this.getHorseRaceById(id).id;
    }

    getHorseRaceById(id: number): HorseRace {
        const found = this.races.find(r => r.id === id);
        if (!found) {
            throw new Error(`Race ${id} not found`);
        }
        return found;
    }

    stopAll(): void {
        this.races.forEach(r => r.stopRace());
    }
}

@Injectable({ providedIn: 'root' })
export class HorseRaceService implements OnDestroy {
    private manager: RaceManager;

    // the IDs, in the order you want them displayed
    private readonly raceIds = [1, 2, 3];

    // which index in raceIds is currently active
    private currentIdx = 0;

    // a subject holding the "current" raceId
    private currentId$ = new BehaviorSubject<number>(this.raceIds[this.currentIdx]);

    // for tearing down our completed‐watch subscription
    private destroy$ = new Subject<void>();

    // expose the stream of “which race is current”
    public readonly id$: Observable<number> = this.currentId$.asObservable();

    constructor() {
        this.manager = new RaceManager(
            ALL_HORSES,
            4,     // runners
            100,   // tick interval (ms)
            10,    // post countdown (s)
            2000   // winning distance (dm)
        );

        // pre-create your races with different pre-countdowns:
        this.manager.createRace(1, 20);
        this.manager.createRace(2, 120);
        this.manager.createRace(3, 220);

        // watch for 'completed' on whichever race is current,
        // then advance to the next race in raceIds
        this.raceState$
            .pipe(
                filter(state => state === 'completed'),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.advanceToNextRace());
    }

    /** switch to the next ID, if any remain */
    private advanceToNextRace(): void {
        if (this.currentIdx + 1 < this.raceIds.length) {
            this.currentIdx++;
            const nextId = this.raceIds[this.currentIdx];
            this.currentId$.next(nextId);
        }
        // else: no more races, you can optionally complete destroy$ here
    }

    // === Exposed streams always follow the current race ID ===

    readonly raceState$: Observable<HorseRaceState> = this.currentId$.pipe(
        switchMap(id => this.manager.getRaceState$(id))
    );

    readonly countdown$: Observable<number> = this.currentId$.pipe(
        switchMap(id => this.manager.getCountdown$(id))
    );

    readonly horsesList$: Observable<RaceHorsesList> = this.currentId$.pipe(
        switchMap(id => this.manager.getHorsesList$(id))
    );

    /** synchronous getters still read the current ID under the hood */
    get winningDistance(): number {
        return this.manager.getWinningDistance(this.currentId$.getValue());
    }
    get id(): number {
        return this.currentId$.getValue();
    }

    /** stop everything on destroy */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.manager.stopAll();
    }
}