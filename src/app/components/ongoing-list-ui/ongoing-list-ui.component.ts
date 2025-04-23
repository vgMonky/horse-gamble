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
import { combineLatest, Subscription } from 'rxjs';
import { OngoingRaceService } from '@app/services/game/ongoing-race.service';
import { OngoingHorseUiComponent } from '@app/components/ongoing-horse-ui/ongoing-horse-ui.component';

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

    private sub = new Subscription();
    private prevPos = new Map<number, number>();

    @ViewChildren('horseTrack', { read: ElementRef })
    horseElems!: QueryList<ElementRef>;

    constructor(
        private ongoingRaceService: OngoingRaceService,
        private renderer: Renderer2,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {
        // capture initial positions
        setTimeout(() => this.recordPositions(), 0);

        this.sub.add(
            combineLatest([
                this.ongoingRaceService.horses$,
                this.ongoingRaceService.podium$
            ]).subscribe(([all, podium]) => {
                // finished first, in exact crossing order
                const finished = podium.map(h => ({ ...h, position: null }));
                // then still racing
                const inRace = all
                    .filter(h => h.position !== null && !podium.includes(h))
                    .sort((a, b) => b.position! - a.position!);
                this.runFLIP([...finished, ...inRace]);
            })
        );

        this.sub.add(
            this.ongoingRaceService.finalPosition$.subscribe(fp => this.finalPosition = fp)
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    trackByHorse(_i: number, h: any) {
        return h.index;
    }

    private recordPositions() {
        this.prevPos.clear();
        this.horseElems.forEach(el => {
            const idx = +el.nativeElement.dataset.index;
            this.prevPos.set(idx, el.nativeElement.getBoundingClientRect().top);
        });
    }

    private runFLIP(newHorses: any[]) {
        const oldPos = this.prevPos;
        this.horses = newHorses;

        this.ngZone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                const newPos = new Map<number, number>();
                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    newPos.set(idx, el.nativeElement.getBoundingClientRect().top);
                });

                // invert
                this.horseElems.forEach(el => {
                    const idx = +el.nativeElement.dataset.index;
                    const delta = (oldPos.get(idx) || 0) - (newPos.get(idx) || 0);
                    if (delta) {
                        this.renderer.setStyle(el.nativeElement, 'transition', 'none');
                        this.renderer.setStyle(el.nativeElement, 'transform', `translateY(${delta}px)`);
                    }
                });

                // force reflow
                this.horseElems.first.nativeElement.getBoundingClientRect();

                // play
                requestAnimationFrame(() => {
                    this.horseElems.forEach(el => {
                        this.renderer.setStyle(el.nativeElement, 'transition', 'transform 300ms ease');
                        this.renderer.setStyle(el.nativeElement, 'transform', 'translateY(0)');
                    });
                    setTimeout(() => this.recordPositions(), 300);
                });
            });
        });
    }
}
