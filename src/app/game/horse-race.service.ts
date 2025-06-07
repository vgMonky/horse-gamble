// src/app/game/horse-race.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { ALL_HORSES, Horse } from './horses-database';
import {
    HorseRace,
    RaceHorsesList,
    HorseRaceState
} from './horse-race.abstract';
import { Observable } from 'rxjs';

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
     * Create & register a new HorseRace with its own `id`.
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
        return race;
    }

    // Control race by id
    startRace(id: number): void {
        this.getHorseRaceById(id).startRace();
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
    private static readonly DEFAULT_ID  = 1;
    private static readonly DEFAULT_PRE = 20;  // seconds

    constructor() {
        // 1) instantiate the manager
        this.manager = new RaceManager(
            ALL_HORSES,
            4,     // number of runners
            100,   // tick interval (ms)
            10,    // post-race countdown (s)
            2000   // winning distance (dm)
        );
        // 2) pre-create the “default” race (#1)
        this.manager.createRace(
            HorseRaceService.DEFAULT_ID,
            HorseRaceService.DEFAULT_PRE
        );
    }

    // --- Default-race API (ID = 1) --- //

    startOngoingRace(): void {
        this.manager.startRace(HorseRaceService.DEFAULT_ID);
    }

    stopOngoingRace(): void {
        this.manager.stopRace(HorseRaceService.DEFAULT_ID);
    }

    get raceState$(): Observable<HorseRaceState> {
        return this.manager.getRaceState$(HorseRaceService.DEFAULT_ID);
    }

    get countdown$(): Observable<number> {
        return this.manager.getCountdown$(HorseRaceService.DEFAULT_ID);
    }

    get horsesList$(): Observable<RaceHorsesList> {
        return this.manager.getHorsesList$(HorseRaceService.DEFAULT_ID);
    }

    get winningDistance(): number {
        return this.manager.getWinningDistance(HorseRaceService.DEFAULT_ID);
    }

    /** Expose the raw HorseRace instance if you need it directly */
    getHorseRaceById(id: number): HorseRace {
        return this.manager.getHorseRaceById(id);
    }

    ngOnDestroy(): void {
        this.manager.stopAll();
    }
}
