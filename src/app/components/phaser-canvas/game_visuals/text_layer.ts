import Phaser from 'phaser';
import { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingRaceState,
    OngoingHorsesList
} from '@app/game/ongoing-race.service';

export class TextLayer {
    private overlay!: Phaser.GameObjects.Graphics;
    private countdownText!: Phaser.GameObjects.Text;
    private messageText!: Phaser.GameObjects.Text;
    private stateSub?: Subscription;
    private countdownSub?: Subscription;
    private horsesSub?: Subscription;
    private latestList?: OngoingHorsesList;

    constructor(
        private scene: Phaser.Scene,
        private raceSvc: OngoingRaceService,
        private opacity: number = 0.5
    ) {}

    create(): void {
        const { width, height } = this.scene.scale;

        // 1) full-screen overlay
        this.overlay = this.scene.add.graphics()
            .fillStyle(0x000000, this.opacity)
            .fillRect(0, 0, width, height)
            .setScrollFactor(0)
            .setDepth(100);

        // 2) countdown text
        this.countdownText = this.scene.add.text(width / 2, height / 2, '', {
            fontFamily: 'Courier, monospace',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center'
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);

        // 3) message text (instruction or podium)
        this.messageText = this.scene.add.text(width / 2, height / 2 + 60, '', {
            fontFamily: 'Courier, monospace',
            fontSize: '18px',
            color: '#ffffff',
            align: 'left'
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);

        // keep latest horses list for podium
        this.horsesSub = this.raceSvc.horsesList$
            .subscribe(list => this.latestList = list);

        // show/hide & content based on state
        this.stateSub = this.raceSvc.raceState$
            .subscribe((state: OngoingRaceState) => {
                const visible = (state === 'pre' || state === 'post');
                this.overlay.setVisible(visible);
                this.countdownText.setVisible(visible);
                this.messageText.setVisible(visible);

                if (state === 'pre') {
                    // pre-race: big countdown + "Make your bet"
                    this.messageText.setText('Race starting in ...');
                } else if (state === 'post') {
                    // post-race: small countdown + podium list
                    const podiumLines = this.latestList
                        ?.getByPlacement()
                        .map((h, i) => `${i + 1}. ${h.horse.name || 'Horse ' + h.slot}`)
                        .join('\n') ?? '';

                    this.messageText.setText(`\n${podiumLines}`);
                }
            });

        // update countdown digits
        this.countdownSub = this.raceSvc.countdown$
            .subscribe(count => {
                this.countdownText.setText(count.toString());
            });

        // clean up on scene end
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
        this.scene.events.once(Phaser.Scenes.Events.DESTROY,  () => this.destroy());
    }

    destroy(): void {
        this.stateSub?.unsubscribe();
        this.countdownSub?.unsubscribe();
        this.horsesSub?.unsubscribe();
        this.overlay.destroy();
        this.countdownText.destroy();
        this.messageText.destroy();
    }
}
