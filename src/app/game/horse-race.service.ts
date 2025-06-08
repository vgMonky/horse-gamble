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
    Subject,
    Observable,
    switchMap,
    filter,
    takeUntil
} from 'rxjs';
import { map } from 'rxjs/operators';

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
    ) {}

    createRace(winDist: number, preSec: number): HorseRace {
        const nextId = this.races.length > 0
            ? this.races[this.races.length - 1].id + 1
            : 1;

        const race = new HorseRace(
            nextId,
            this.allHorses,
            this.runnerCount,
            this.tickMs,
            preSec,
            this.postSec,
            winDist
        );
        this.races.push(race);
        race.startRace();
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

    /** Return all IDs in creation order */
    getAllRaceIds(): number[] {
        return this.races.map(r => r.id);
    }

    private getHorseRaceById(id: number): HorseRace {
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
    private ongoingId$: BehaviorSubject<number>;
    private destroy$ = new Subject<void>();

    // Exposed observables:
    public readonly id$: Observable<number>;
    public readonly raceState$: Observable<HorseRaceState>;
    public readonly countdown$: Observable<number>;
    public readonly horsesList$: Observable<RaceHorsesList>;
    public readonly winningDistance$: Observable<number>;

    constructor() {
        this.manager = new RaceManager(
            ALL_HORSES,
            4,     // runners
            100,   // tick interval (ms)
            10,    // post-race countdown (s)
        );

        // create N async races scheduled at a countdown:
        this.manager.createRace(2000, 20);
        this.manager.createRace(2000, 100);
        this.manager.createRace(2000, 180);
        this.manager.createRace(4000, 260);
        this.manager.createRace(4000, 340);
        this.manager.createRace(6000, 420);
        // This could be races generated for the day: "createRaceday()"

        // seed currentId$ with the first ID that actually exists:
        const ids = this.manager.getAllRaceIds();
        if (ids.length === 0) {
            throw new Error('No races defined');
        }
        this.ongoingId$ = new BehaviorSubject<number>(ids[0]);
        this.id$         = this.ongoingId$.asObservable();

        // each public stream follows whatever the current ID is:
        this.raceState$  = this.ongoingId$.pipe(switchMap(id => this.manager.getRaceState$(id)));
        this.countdown$  = this.ongoingId$.pipe(switchMap(id => this.manager.getCountdown$(id)));
        this.horsesList$ = this.ongoingId$.pipe(switchMap(id => this.manager.getHorsesList$(id)));
        this.winningDistance$ = this.id$.pipe(
            map(id => this.manager.getWinningDistance(id))
        );

        // whenever the *current* race completes, advance to the next:
        this.raceState$
            .pipe(
                filter(state => state === 'completed'),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.advanceToNextRace());
    }

    private advanceToNextRace(): void {
        const ids = this.manager.getAllRaceIds();
        const curr = this.ongoingId$.getValue();
        const idx  = ids.indexOf(curr);
        if (idx >= 0 && idx < ids.length - 1) {
            this.ongoingId$.next(ids[idx + 1]);
        }
        // else: we’re done with all races
    }

    /** convenience getters for sync reads */
    get id(): number {
        return this.ongoingId$.getValue();
    }
    get winningDistance(): number {
        return this.manager.getWinningDistance(this.id);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.manager.stopAll();
    }
}
