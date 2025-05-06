// src/app/components/ongoing-list-ui/ongoing-list-ui.component.ts
import {
    Component,
    AfterViewInit,
    OnDestroy,
    ViewChildren,
    QueryList,
    ElementRef,
    Renderer2,
    NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { OngoingRaceService, OngoingHorse } from '@app/game/ongoing-race.service';
import { OngoingHorseUiComponent } from '@app/components/ongoing-horse-ui/ongoing-horse-ui.component';
import { BREAKPOINT } from 'src/types';

@Component({
    standalone: true,
    selector: 'app-ongoing-list-ui',
    imports: [CommonModule, OngoingHorseUiComponent],
    templateUrl: './ongoing-list-ui.component.html',
    styleUrls: ['./ongoing-list-ui.component.scss']
})
export class OngoingListUiComponent implements AfterViewInit, OnDestroy {
    horsesList: OngoingHorse[] = [];
    isMobileView = false;

    /** your 4-color palette */
    readonly colors = [
        'hsl(0,70%,35%)',
        'hsl(90,70%,35%)',
        'hsl(180,70%,35%)',
        'hsl(270,70%,35%)'
    ];

    /** stable mapping: horse.index → color */
    readonly horseColorMap = new Map<number,string>();

    private destroy$ = new Subject<void>();
    private prevPos = new Map<number, { x: number; y: number }>();

    @ViewChildren('horseTrack', { read: ElementRef })
    horseElems!: QueryList<ElementRef>;

    constructor(
        private ongoingRaceService: OngoingRaceService,
        private breakpointObserver: BreakpointObserver,
        private renderer: Renderer2,
        private ngZone: NgZone
    ) {
        // track layout
        this.breakpointObserver
            .observe(BREAKPOINT)
            .pipe(takeUntil(this.destroy$))
            .subscribe(r => this.isMobileView = r.matches);

        // subscribe to the sorted list
        this.ongoingRaceService.horsesList$
            .pipe(takeUntil(this.destroy$))
            .subscribe(list => {
                const sorted = list.getByPlacement();

                // assign any new horses a color, in palette order
                sorted.forEach((h, idx) => {
                    if (!this.horseColorMap.has(h.horse.index)) {
                        const color = this.colors[this.horseColorMap.size % this.colors.length];
                        this.horseColorMap.set(h.horse.index, color);
                    }
                });

                this.runFLIP(sorted);
            });
    }

    ngAfterViewInit(): void {
        this.recordPositions();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private recordPositions(): void {
        this.prevPos.clear();
        this.horseElems.forEach(el => {
            const idx = +el.nativeElement.dataset.index;
            const { left: x, top: y } = el.nativeElement.getBoundingClientRect();
            this.prevPos.set(idx, { x, y });
        });
    }

    private runFLIP(newList: OngoingHorse[]): void {
        const oldPos = new Map(this.prevPos);
        this.horsesList = newList;

        this.ngZone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                const newPos = new Map<number, { x: number; y: number }>();
                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const { left: x, top: y } = el.nativeElement.getBoundingClientRect();
                    newPos.set(idx, { x, y });
                });

                // invert + animate
                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const old = oldPos.get(idx);
                    const now = newPos.get(idx);
                    if (!old || !now) return;
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

                this.horseElems.first?.nativeElement.getBoundingClientRect();

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
