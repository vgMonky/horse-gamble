// src/app/components/phaser-canvas/phaser-canvas.component.ts
import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild
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
import { skip } from 'rxjs/operators';

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

    isMobileView$: Observable<boolean>;
    markerOpacity = 1;
    lightnessValue = 0.1;
    isMuted = false;

    private game?: Phaser.Game;
    private gameSubs: Subscription[] = [];

    constructor(
        private breakpointObserver: BreakpointObserver,
        private horseRaceService: HorseRaceService
    ) {
        this.isMobileView$ = this.breakpointObserver
            .observe(BREAKPOINT)
            .pipe(map(result => result.matches));
    }

    ngOnInit(): void {
        // 1) start the first game
        this.startGame();

        // 2) whenever the service’s id$ changes (i.e. new race),
        //    destroy & re-create the game
        this.gameSubs.push(
            this.horseRaceService.id$
                .pipe(skip(1))
                .subscribe(() => this.resetGame())
        );
    }

    ngOnDestroy(): void {
        // tear down subscriptions
        this.gameSubs.forEach(s => s.unsubscribe());
        // destroy Phaser
        this.game?.destroy(true);
    }

    private startGame(): void {
        // instantiate the scene
        const scene = new MainScene(
            this.horseRaceService,
            () => this.markerOpacity,
            () => this.lightnessValue,
            () => this.isMuted
        );
        // boot Phaser
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: 1000,
            height: 250,
            parent: this.containerRef.nativeElement,
            scene
        });
    }

    private resetGame(): void {
        this.game?.destroy(true);
        this.startGame();
    }
}
