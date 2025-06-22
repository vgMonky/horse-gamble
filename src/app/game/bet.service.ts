import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import type { HorseSlot } from './horse-race.abstract';
import { HorseRaceService } from './horse-race.service';

/** Represents a single bet on a race. */
export class Bet {
    constructor(
        public betId: number,
        public raceId: number,
        public betActor: string,
        public betPick: HorseSlot,
        public betAmount: number
    ) {}

    /** Logs a human-readable description of this bet. */
    log(): void {
        console.log(
            `
            [Bet ${this.betId}]
            race=${this.raceId}
            actor="${this.betActor}"
            pick=${this.betPick}
            amount=${this.betAmount}
            `
        );
    }
}

/**
 * Core bet-management logic.
 */
export class BetManager {
    protected bets: Bet[] = [];
    protected betsSubject = new BehaviorSubject<Bet[]>([]);
    protected nextBetId = 1;

    constructor(private raceService: HorseRaceService) {}

    /** Create, store, emit and log a new Bet - only if race is still 'pre'. */
    async generateBet(
        raceId: number,
        betActor: string,
        betPick: HorseSlot,
        betAmount: number
    ): Promise<Bet> {
        // 1) Validate pick
        if (betPick < 0 || betPick > 3) {
            throw new Error(`Invalid slot ${betPick}. Must be 0-3.`);
        }

        // 2) Validate amount
        if (betAmount <= 0) {
            throw new Error(`Invalid amount ${betAmount}. Must be >= 1.`);
        }

        // 3) Check race state
        const state = await firstValueFrom(
            this.raceService.manager.getRaceState$(raceId)
        );
        if (state !== 'pre') {
            throw new Error(
                `Cannot place bet: race ${raceId} is already '${state}'.`
            );
        }

        // 4) Place the bet
        const bet = new Bet(
            this.nextBetId++,
            raceId,
            betActor,
            betPick,
            betAmount
        );
        bet.log();
        this.bets.push(bet);
        this.betsSubject.next([...this.bets]);
        return bet;
    }

    /** Stream of all bets. */
    getAllBets$(): Observable<Bet[]> {
        return this.betsSubject.asObservable();
    }
}

@Injectable({ providedIn: 'root' })
export class BetService {
    public manager: BetManager;

    constructor(private raceService: HorseRaceService) {
        this.manager = new BetManager(raceService);
    }
}
