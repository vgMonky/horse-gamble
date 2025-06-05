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
    private prevY = new Map<number, number>();

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
                setTimeout(() => this.runFLIP(listInstance.getByPlacement()), 0);
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
        this.prevY.clear();
        this.horseElems.forEach(el => {
            const idx = +el.nativeElement.dataset.index;
            const { top: y } = el.nativeElement.getBoundingClientRect();
            this.prevY.set(idx, y);
        });
    }

    private runFLIP(newList: OngoingHorse[]): void {
        const oldYMap = new Map(this.prevY);
        this.horsesList = newList;

        this.ngZone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                const newYMap = new Map<number, number>();
                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const { top: y } = el.nativeElement.getBoundingClientRect();
                    newYMap.set(idx, y);
                });

                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const oldY = oldYMap.get(idx);
                    const newY = newYMap.get(idx);
                    if (oldY == null || newY == null) return;

                    const deltaY = oldY - newY;
                    if (deltaY) {
                        this.renderer.setStyle(el.nativeElement, 'transition', 'none');
                        this.renderer.setStyle(el.nativeElement, 'transform', `translateY(${deltaY}px)`);
                    }
                });

                // Force reflow
                this.horseElems.first?.nativeElement.getBoundingClientRect();

                requestAnimationFrame(() => {
                    this.horseElems.forEach(el => {
                        const idx = +el.nativeElement.dataset.index;
                        const oldY = oldYMap.get(idx);
                        const newY = newYMap.get(idx);
                        // Only animate if there was an actual vertical shift
                        if (oldY != null && newY != null && oldY !== newY) {
                            this.renderer.setStyle(el.nativeElement, 'transition', 'transform 200ms linear');
                            this.renderer.setStyle(el.nativeElement, 'transform', 'translateY(0)');
                        }
                    });
                    setTimeout(() => this.recordPositions(), 1);
                });
            });
        });
    }

    getColor(slot: number): string {
        return SLOT_COLOR_MAP[slot] ?? 'black';
    }
}
