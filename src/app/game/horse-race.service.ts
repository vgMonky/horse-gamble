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
    getCompleted(id: number): boolean {
        return this.getHorseRaceById(id).completed;
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
    private static readonly OngoingRaceID  = 1;

    constructor() {
        // 1) instantiate the manager
        this.manager = new RaceManager(
            ALL_HORSES,
            4,     // number of runners
            100,   // tick interval (ms)
            10,    // post-race countdown (s)
            2000   // winning distance (dm)
        );
        this.manager.createRace(1, 20)
        this.manager.createRace(2, 120);
        this.manager.createRace(3, 220);
    }

    // Interface for UI updates based on OngoingRaceID
    get raceState$(): Observable<HorseRaceState> {
        return this.manager.getRaceState$(HorseRaceService.OngoingRaceID);
    }
    get countdown$(): Observable<number> {
        return this.manager.getCountdown$(HorseRaceService.OngoingRaceID);
    }
    get horsesList$(): Observable<RaceHorsesList> {
        return this.manager.getHorsesList$(HorseRaceService.OngoingRaceID);
    }
    get winningDistance(): number {
        return this.manager.getWinningDistance(HorseRaceService.OngoingRaceID);
    }
    get id(): number {
        return this.manager.getID(HorseRaceService.OngoingRaceID);
    }

    ngOnDestroy(): void {
        this.manager.stopAll();
    }
}
