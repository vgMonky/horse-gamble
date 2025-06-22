// src/app/game/bet.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Represents a single bet on a race. */
export class Bet {
    constructor(
        public betId: number,
        public raceId: number,
        public betActor: string,
        public betPick: number,
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

    /** Create, store, emit and log a new Bet. */
    generateBet(
        raceId: number,
        betActor: string,
        betPick: number,
        betAmount: number
    ): Bet {
        const bet = new Bet(this.nextBetId++, raceId, betActor, betPick, betAmount);
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
    public manager = new BetManager();

    constructor() {}
}
