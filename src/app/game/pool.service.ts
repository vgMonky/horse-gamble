// src/app/game/pool.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';
import { Bet, BetMode, BetService } from './bet.service';
import { HorseRaceService } from './horse-race.service';

export class Pool {
    private betsSubject  = new BehaviorSubject<Bet[]>([]);
    public  bets$         = this.betsSubject.asObservable();

    private totalSubject = new BehaviorSubject<number>(0);
    public  total$        = this.totalSubject.asObservable();

    constructor(
        public raceId: number,
        public betMode: BetMode
    ) {
        console.log(`Created Pool for race ${raceId}, mode ${betMode}`);
    }

    addBet(bet: Bet): void {
        if (bet.raceId !== this.raceId || bet.betMode !== this.betMode) {
            return;
        }

        // derive the new array from the subject
        const current = this.betsSubject.getValue();
        const updated = [...current, bet];
        this.betsSubject.next(updated);

        // update total
        const newTotal = this.totalSubject.getValue() + bet.betAmount;
        this.totalSubject.next(newTotal);

        console.log(`Pool [${this.raceId}-${this.betMode}] added Bet ${bet.betId}, total=${newTotal}`);
    }

    log(): void {
        const ids   = this.betsSubject.getValue().map(b => b.betId);
        const total = this.totalSubject.getValue();
        console.log(
            `Pool race=${this.raceId}, mode=${this.betMode}, bets=[${ids.join(', ')}], total=${total}`
        );
    }
}

export class PoolManager {
    private pools: Pool[] = [];
    private modes: BetMode[] = ['win', 'exacta'];
    private subs = new Subscription();

    constructor(
        allRaceIds$: Observable<number[]>,
        allBets$:    Observable<Bet[]>
    ) {
        // 1) create pools for every race + mode
        this.subs.add(
            allRaceIds$.subscribe(ids => {
                ids.forEach(id => {
                    this.modes.forEach(mode => {
                        if (!this.pools.some(p => p.raceId === id && p.betMode === mode)) {
                            this.pools.push(new Pool(id, mode));
                        }
                    });
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
                        p => p.raceId === bet.raceId && p.betMode === bet.betMode
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
    getPool(raceId: number, betMode: BetMode): Pool | undefined {
        return this.pools.find(p => p.raceId === raceId && p.betMode === betMode);
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
