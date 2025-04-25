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
import { Subscription } from 'rxjs';
import { OngoingRaceService, Standing } from '@app/services/game/ongoing-race.service';
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
    standings: Standing[] = [];
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
        // viewport watcher
        this.sub.add(
            this.breakpointObserver
                .observe(BREAKPOINT)
                .subscribe(r => this.isMobileView = r.matches)
        );

        // capture for FLIP
        setTimeout(() => this.recordPositions(), 0);

        // subscribe finalPosition$
        this.sub.add(
            this.ongoingRaceService.finalPosition$
                .subscribe(fp => this.finalPosition = fp)
        );

        // subscribe to standings$
        this.sub.add(
            this.ongoingRaceService.standings$
                .subscribe(s => this.runFLIP(s))
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    trackByHorse(_i: number, s: Standing) {
        return s.horse.index;
    }

    private recordPositions(): void {
        this.prevPos.clear();
        this.horseElems.forEach(el => {
            const idx = +el.nativeElement.dataset.index;
            const rect = el.nativeElement.getBoundingClientRect();
            this.prevPos.set(idx, { x: rect.left, y: rect.top });
        });
    }

    private runFLIP(newStandings: Standing[]): void {
        const oldPos = this.prevPos;
        this.standings = newStandings;

        this.ngZone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                // read new positions
                const newPos = new Map<number, { x: number; y: number }>();
                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const rect = el.nativeElement.getBoundingClientRect();
                    newPos.set(idx, { x: rect.left, y: rect.top });
                });

                // invert & animate
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

                // play animation
                requestAnimationFrame(() => {
                    this.horseElems.forEach(el => {
                        this.renderer.setStyle(el.nativeElement, 'transition', 'transform 300ms ease');
                        this.renderer.setStyle(el.nativeElement, 'transform', 'translate(0, 0)');
                    });
                    setTimeout(() => this.recordPositions(), 300);
                });
            });
        });
    }
}
