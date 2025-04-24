// src/app/components/ongoing-list-ui/ongoing-list-ui.component.ts
import {
    Component,
    OnInit,
    OnDestroy,
    ViewChildren,
    QueryList,
    ElementRef,
    Renderer2,
    NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { combineLatest, Subscription } from 'rxjs';
import { OngoingRaceService } from '@app/services/game/ongoing-race.service';
import { OngoingHorseUiComponent } from '@app/components/ongoing-horse-ui/ongoing-horse-ui.component';
import { BREAKPOINT } from 'src/types';

@Component({
    standalone: true,
    selector: 'app-ongoing-list-ui',
    imports: [CommonModule, OngoingHorseUiComponent],
    templateUrl: './ongoing-list-ui.component.html',
    styleUrls: ['./ongoing-list-ui.component.scss']
})
export class OngoingListUiComponent implements OnInit, OnDestroy {
    horses: any[] = [];
    finalPosition = 0;
    isMobileView = false;

    private sub = new Subscription();
    private prevPos = new Map<number, { x: number; y: number }>();

    @ViewChildren('horseTrack', { read: ElementRef })
    horseElems!: QueryList<ElementRef>;

    constructor(
        private ongoingRaceService: OngoingRaceService,
        private breakpointObserver: BreakpointObserver,
        private renderer: Renderer2,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {
        // 1) watch viewport
        this.sub.add(
            this.breakpointObserver
                .observe(BREAKPOINT)
                .subscribe(r => this.isMobileView = r.matches)
        );

        // 2) capture initial positions for FLIP
        setTimeout(() => this.recordPositions(), 0);

        // 3) race + podium combined → reorder via FLIP
        this.sub.add(
            combineLatest([
                this.ongoingRaceService.horses$,
                this.ongoingRaceService.podium$
            ]).subscribe(([all, podium]) => {
                const finished = podium.map(h => ({ ...h, position: null }));
                const inRace = all
                    .filter(h => h.position !== null && !podium.includes(h))
                    .sort((a, b) => b.position! - a.position!);
                this.runFLIP([...finished, ...inRace]);
            })
        );

        // 4) subscribe finalPosition
        this.sub.add(
            this.ongoingRaceService.finalPosition$
                .subscribe(fp => this.finalPosition = fp)
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    trackByHorse(_i: number, h: any) {
        return h.index;
    }

    private recordPositions(): void {
        this.prevPos.clear();
        this.horseElems.forEach(el => {
            const idx = +el.nativeElement.dataset.index;
            const rect = el.nativeElement.getBoundingClientRect();
            this.prevPos.set(idx, { x: rect.left, y: rect.top });
        });
    }

    private runFLIP(newHorses: any[]): void {
        const oldPos = this.prevPos;
        this.horses = newHorses;

        this.ngZone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                // read new positions
                const newPos = new Map<number, { x: number; y: number }>();
                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const rect = el.nativeElement.getBoundingClientRect();
                    newPos.set(idx, { x: rect.left, y: rect.top });
                });

                // invert on the correct axis
                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const old = oldPos.get(idx)!;
                    const now = newPos.get(idx)!;
                    const delta = this.isMobileView
                        ? (old.y - now.y)
                        : (old.x - now.x);
                    if (delta) {
                        this.renderer.setStyle(el.nativeElement, 'transition', 'none');
                        const transform = this.isMobileView
                            ? `translateY(${delta}px)`
                            : `translateX(${delta}px)`;
                        this.renderer.setStyle(el.nativeElement, 'transform', transform);
                    }
                });

                // force reflow
                this.horseElems.first.nativeElement.getBoundingClientRect();

                // animate back to zero
                requestAnimationFrame(() => {
                    this.horseElems.forEach(el => {
                        this.renderer.setStyle(el.nativeElement, 'transition', 'transform 300ms ease');
                        this.renderer.setStyle(el.nativeElement, 'transform', 'translate(0, 0)');
                    });
                    // update for next tick
                    setTimeout(() => this.recordPositions(), 300);
                });
            });
        });
    }
}
