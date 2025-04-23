// ongoing-list-ui.component.ts
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
import { Subscription } from 'rxjs';
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
    private prevPositions = new Map<number, number>();

    @ViewChildren('horseTrack', { read: ElementRef })
    horseElems!: QueryList<ElementRef>;

    constructor(
        private ongoingRaceService: OngoingRaceService,
        private renderer: Renderer2,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {
        // Record initial positions after first render
        setTimeout(() => this.recordPositions(), 0);

        this.sub.add(
            this.ongoingRaceService.horses$.subscribe(list => {
                // 1) capture old positions
                const oldPos = this.getPositions();

                // 2) reorder data
                this.horses = [...list].sort((a, b) => b.position - a.position);

                // 3) run FLIP outside Angular
                this.ngZone.runOutsideAngular(() => {
                    requestAnimationFrame(() => {
                        // read new positions
                        const newPos = this.getPositions();

                        // apply the invert step (no transition)
                        this.horseElems.forEach(el => {
                            const idx = Number(el.nativeElement.dataset.index);
                            const delta = (oldPos.get(idx) || 0) - (newPos.get(idx) || 0);
                            if (delta) {
                                this.renderer.setStyle(el.nativeElement, 'transition', 'none');
                                this.renderer.setStyle(
                                    el.nativeElement,
                                    'transform',
                                    `translateY(${delta}px)`
                                );
                            }
                        });

                        // force a reflow
                        this.horseElems.first.nativeElement.getBoundingClientRect();

                        // 4) next frame: animate back to zero
                        requestAnimationFrame(() => {
                            this.horseElems.forEach(el => {
                                this.renderer.setStyle(
                                    el.nativeElement,
                                    'transition',
                                    'transform 300ms ease'
                                );
                                this.renderer.setStyle(el.nativeElement, 'transform', 'translateY(0)');
                            });

                            // update prevPositions after animation completes
                            setTimeout(() => this.recordPositions(), 300);
                        });
                    });
                });
            })
        );

        this.sub.add(
            this.ongoingRaceService.finalPosition$.subscribe(fp => (this.finalPosition = fp))
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    trackByHorse(_i: number, h: any) {
        return h.index;
    }

    private getPositions(): Map<number, number> {
        const map = new Map<number, number>();
        this.horseElems.forEach(el => {
            const idx = Number(el.nativeElement.dataset.index);
            map.set(idx, el.nativeElement.getBoundingClientRect().top);
        });
        return map;
    }

    private recordPositions(): void {
        this.prevPositions = this.getPositions();
    }
}
