// src/app/game/bet.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Types of bets that can be placed. */
export type BetMode = 'win' | 'exacta' ;

/** Represents a single bet on a race. */
export class Bet {
    constructor(
        public betId: number,
        public raceId: number,
        public betActor: string,
        public betMode: BetMode,
        public betPicks: number[],
        public betAmount: number
    ) {}

    /** Logs a human-readable description of this bet. */
    log(): void {
        console.log(
            `
            [Bet ${this.betId}]
            race=${this.raceId}
            actor="${this.betActor}"
            mode=${this.betMode}
            picks=[${this.betPicks.join(', ')}]
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
        betMode: BetMode,
        betPicks: number[],
        betAmount: number
    ): Bet {
        const bet = new Bet(this.nextBetId++, raceId, betActor, betMode, betPicks, betAmount);
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

    constructor() {
        // on startup, create two example bets:
        this.manager.generateBet(1, 'AliceWallet', 'win', [2], 100);
        this.manager.generateBet(2, 'BobWallet',     'exacta', [1, 3], 50);
    }

    /** Expose the bets stream */
    getAllBets$(): Observable<Bet[]> {
        return this.manager.getAllBets$();
    }
}
