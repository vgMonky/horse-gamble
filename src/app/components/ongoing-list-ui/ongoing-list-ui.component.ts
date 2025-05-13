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
import {
    OngoingRaceService,
    OngoingHorse,
    OngoingHorsesList,
    SLOT_COLOR_MAP
} from '@app/game/ongoing-race.service';
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

    private lastListInstance?: OngoingHorsesList;
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
        this.breakpointObserver
            .observe(BREAKPOINT)
            .pipe(takeUntil(this.destroy$))
            .subscribe(r => this.isMobileView = r.matches);

        this.ongoingRaceService.horsesList$
            .pipe(takeUntil(this.destroy$))
            .subscribe(listInstance => {
                if (listInstance !== this.lastListInstance) {
                    this.lastListInstance = listInstance;
                }
                this.runFLIP(listInstance.getByPlacement());
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

                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const old = oldPos.get(idx);
                    const now = newPos.get(idx);
                    if (!old || !now) return;

                    const delta = this.isMobileView
                        ? (old.y - now.y)
                        : (old.y - now.y);

                    if (delta) {
                        this.renderer.setStyle(el.nativeElement, 'transition', 'none');
                        const transform = this.isMobileView
                            ? `translateY(${delta}px)`
                            : `translateY(${delta}px)`;
                        this.renderer.setStyle(el.nativeElement, 'transform', transform);
                    }
                });

                this.horseElems.first?.nativeElement.getBoundingClientRect();

                requestAnimationFrame(() => {
                    this.horseElems.forEach(el => {
                        this.renderer.setStyle(el.nativeElement, 'transition', 'transform 300ms ease');
                        this.renderer.setStyle(el.nativeElement, 'transform', 'translate(0, 0)');
                    });
                    setTimeout(() => this.recordPositions(), 50);
                });
            });
        });
    }

    getColor(slot: number): string {
        return SLOT_COLOR_MAP[slot] ?? 'black';
    }
}
