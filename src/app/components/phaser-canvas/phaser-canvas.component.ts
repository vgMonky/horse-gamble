// src/app/components/phaser-canvas/phaser-canvas.component.ts
import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    Input
} from '@angular/core';
import Phaser from 'phaser';
import { MainScene } from './game_visuals/main_scene';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BREAKPOINT } from 'src/types';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { HorseRaceService } from '@app/game/horse-race.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpandableComponent } from '../base-components/expandable/expandable.component';

@Component({
    selector: 'app-phaser-canvas',
    templateUrl: './phaser-canvas.component.html',
    styleUrls: ['./phaser-canvas.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ExpandableComponent
    ]
})
export class PhaserCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('phaserContainer', { static: true })
    containerRef!: ElementRef;
    @Input() raceId!: number;

    isMobileView$: Observable<boolean>;
    showCanvasInput = false;

    markerOpacity = 0;
    lightnessValue = 0.1;
    followFirst = true;
    horseFollow = 0;
    followHorse = false;
    isMuted = false;

    private game?: Phaser.Game;
    private horsesSub?: Subscription;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private horseRaceService: HorseRaceService
    ) {
        this.isMobileView$ = this.breakpointObserver
            .observe(BREAKPOINT)
            .pipe(map(result => result.matches));
    }

    ngOnInit(): void {
        this.startGame();
        this.watchHorseSeparation();
    }

    ngOnDestroy(): void {
        // destroy Phaser
        this.game?.destroy(true);
        this.horsesSub?.unsubscribe();
    }

    private startGame(): void {
        // instantiate the scene
        const scene = new MainScene(
            this.raceId,
            this.horseRaceService,
            () => this.markerOpacity,
            () => this.lightnessValue,
            () => this.followFirst,
            () => this.horseFollow,
            () => this.followHorse,
            () => this.isMuted
        );
        // boot Phaser
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: 1000,
            height: 250,
            parent: this.containerRef.nativeElement,
            scene,
            input: {
                // allow wheel to bubble so the page can scroll
                mouse: {
                    preventDefaultWheel: false
                },
                // stop Phaser from doing event.preventDefault() on touch
                touch: {
                    capture: false
                }
            }
        });
    }

    togglePlacementFollow() {
        if (this.followFirst == true) {
            this.followFirst = false;
        }else {this.followFirst = true}
        this.followHorse = false;
    }

    setHorseFollow(index: number) {
        const horseCount = 4;
        const normalized = ((index % horseCount) + horseCount) % horseCount;
        this.horseFollow = normalized;
        this.followHorse = true;
    }

    private watchHorseSeparation() {
        // subscribe to the live list of horses
        this.horsesSub = this.horseRaceService
        .manager
        .getHorsesList$(this.raceId)
        .subscribe(list => {
            const byPlace = list.getByPlacement();
            if (byPlace.length >= 4) {
                const firstPos = byPlace[0].position;
                const lastPos  = byPlace[3].position;
                // only show overlay if gap > 50
                console.log(`delta= ${(firstPos - lastPos) > 20}`);
                this.showCanvasInput = (firstPos - lastPos) > 20;
            } else {
                this.showCanvasInput = false;
            }
        });
    }
}
