// src/app/game/pool.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';
import { Bet, BetService } from './bet.service';
import { HorseRaceService } from './horse-race.service';
import type { HorseSlot } from './horse-race.abstract';


export class Pool {
    private betsSubject  = new BehaviorSubject<Bet[]>([]);
    public  bets$         = this.betsSubject.asObservable();

    private totalSubject = new BehaviorSubject<number>(0);
    public  total$       = this.totalSubject.asObservable();

    private oddsSubject  = new BehaviorSubject<number[]>([0, 0, 0, 0]);
    public  odds$        = this.oddsSubject.asObservable();

    constructor(
        public raceId: number,
    ) {
        console.log(`Created Pool for race ${raceId}`);
    }

    addBet(bet: Bet): void {
        if (bet.raceId !== this.raceId) return;

        // 1) store bet
        const currentBets = this.betsSubject.getValue();
        const updatedBets = [...currentBets, bet];
        this.betsSubject.next(updatedBets);

        // 2) update running total
        const newTotal = this.totalSubject.getValue() + bet.betAmount;
        this.totalSubject.next(newTotal);

        // 3) recalculate odds
        this.updateOdds();

        console.log(`Bet ${bet.betId} added to Pool [${this.raceId}]`);
        this.log()
    }

        /** Compute fractional win‐odds for each HorseSlot: (poolTotal – stakeOnSlot) / stakeOnSlot */    private updateOdds(): void {
        const total = this.totalSubject.getValue();
        const bets = this.betsSubject.getValue();

        // enforce only valid HorseSlot values
        const slots: HorseSlot[] = [0, 1, 2, 3];
        const odds = slots.map(slot => {
            const stakeOnSlot = bets
                .filter((b: Bet) => b.betPick === slot)
                .reduce((sum: number, b: Bet) => sum + b.betAmount, 0);

            return stakeOnSlot === 0
                ? 0
                : (total - stakeOnSlot) / stakeOnSlot;
        });

        this.oddsSubject.next(odds);
    }

    log(): void {
        const bets = this.betsSubject.getValue();
        console.log(`
        Pool race=${this.raceId},
        total=${this.totalSubject.getValue()},
        odds=[${this.oddsSubject.getValue().map(o => o.toFixed(2)).join(', ')}]
        bets=[${bets.map((b: Bet) => b.betId).join(', ')}]
        `);
    }
}


export class PoolManager {
    private pools: Pool[] = [];
    private subs = new Subscription();

    constructor(
        allRaceIds$: Observable<number[]>,
        allBets$:    Observable<Bet[]>
    ) {
        // 1) create pools for every race
        this.subs.add(
            allRaceIds$.subscribe(ids => {
                ids.forEach(id => {
                    this.pools.push(new Pool(id));
                });
            })
        );

        // 2) listen for “new” bets and route them
        this.subs.add(
            allBets$
                .pipe(map(bets => bets[bets.length - 1]))
                .subscribe(bet => {
                    if (!bet) return;
                    const pool = this.pools.find(
                        p => p.raceId === bet.raceId
                    );
                    pool?.addBet(bet);
                })
        );
    }

    /** inspect or iterate all pools */
    getPools(): Pool[] {
        return [...this.pools];
    }

    /** Retrieve the Pool for the given raceId and betMode */
    getPool(raceId: number): Pool | undefined {
        return this.pools.find(p => p.raceId === raceId);
    }

    /** manually tear down subscriptions */
    destroy(): void {
        this.subs.unsubscribe();
    }
}

@Injectable({ providedIn: 'root' })
export class PoolService implements OnDestroy {
    public manager: PoolManager;

    constructor(
        horseRaceService: HorseRaceService,
        betService:       BetService
    ) {
        this.manager = new PoolManager(
            horseRaceService.getAllRaceIds$(),
            betService.manager.getAllBets$()
        );
    }

    ngOnDestroy(): void {
        this.manager.destroy();
    }
}
