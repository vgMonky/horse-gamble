import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    ElementRef,
    ViewChild
    } from '@angular/core';
import Phaser from 'phaser';

@Component({
    selector: 'app-phaser-canvas',
    templateUrl: './phaser-canvas.component.html',
    styleUrls: ['./phaser-canvas.component.scss'],
    standalone: true
})
export class PhaserCanvasComponent implements OnInit, OnDestroy, OnChanges {
    @Input() useHorse1: boolean = true;

    @ViewChild('phaserContainer', { static: true }) containerRef!: ElementRef;

    private game?: Phaser.Game;

    ngOnInit(): void {
        this.startGame();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['useHorse1'] && !changes['useHorse1'].firstChange) {
            this.restartScene();
        }
    }

    ngOnDestroy(): void {
        this.game?.destroy(true);
    }

    private startGame(): void {
        const self = this;

        class MainScene extends Phaser.Scene {
            private horseSprite?: Phaser.GameObjects.Sprite;

            preload() {
                this.load.spritesheet('horse1', 'assets/game-img/sprite-sheet/horse-sprite-sheet-1.jpg', {
                    frameWidth: 430,
                    frameHeight: 300,
                });
                this.load.spritesheet('horse2', 'assets/game-img/sprite-sheet/horse-sprite-sheet-2.jpg', {
                    frameWidth: 400,
                    frameHeight: 300,
                });
            }

            create() {
                this.horseSprite = this.add.sprite(150, 150, 'horse1');

                this.anims.create({
                    key: 'run1',
                    frames: this.anims.generateFrameNumbers('horse1', {
                        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                    }),
                    frameRate: 15,
                    repeat: -1,
                });

                this.anims.create({
                    key: 'run2',
                    frames: this.anims.generateFrameNumbers('horse2', {
                        frames: [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8],
                    }),
                    frameRate: 15,
                    repeat: -1,
                });

                const initialKey = self.useHorse1 ? 'run1' : 'run2';
                this.horseSprite.setScale(0.5).play(initialKey);
            }

            override update() {
                if (this.horseSprite) {
                    const desiredKey = self.useHorse1 ? 'run1' : 'run2';
                    if (this.horseSprite.anims.currentAnim?.key !== desiredKey) {
                        this.horseSprite.play(desiredKey);
                    }
                }
            }
        }

        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: 300,
            height: 300,
            parent: this.containerRef.nativeElement,
            scene: [MainScene],
        });
    }

    private restartScene(): void {
        this.game?.scene.start('MainScene');
    }
}
