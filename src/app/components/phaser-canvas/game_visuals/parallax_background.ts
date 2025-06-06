// src/app/components/phaser-canvas/game_visuals/parallax_background.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingHorsesList,
    OngoingHorse
} from '@app/game/horse-race.service';

interface Layer {
    sprite:   Phaser.GameObjects.TileSprite;
    key:      string;
    speed:    number;
    original: number;
    scale:    number;
}

interface LayerConfig {
    key: string;
    speed: number;
    yFactor: number;
    scale: number;
    spacing?: number;
    offsetX?: number;
    tileOffsetX?: number;
    offsetTileY?: number;
    xRepeatFactor?: number;
}

export class ParallaxBackground {
    private layers: Layer[] = [];
    private sub?: Subscription;
    private raceStateSub?: Subscription;
    private raceState: 'pre' | 'in' | 'post' = 'pre';

    constructor(
        private scene: Phaser.Scene,
        private raceSvc: OngoingRaceService
    ) {
        this.scene.events.once('shutdown', () => this.destroy());
    }

    preload(): void {
        const assets = [
            { key: 'cloud1', path: 'assets/game-img/background/cloud_1.png' },
            { key: 'cloud2', path: 'assets/game-img/background/cloud_2.png' },
            { key: 'cloud3', path: 'assets/game-img/background/cloud_3.png' },
            { key: 'forest', path: 'assets/game-img/background/forest_bg.png' },
            { key: 'trees3', path: 'assets/game-img/background/darken/grass_trees.png' },
            { key: 'trees2', path: 'assets/game-img/background/darken/grass_trees.png' },
            { key: 'trees1', path: 'assets/game-img/background/darken/grass_trees.png' },
            { key: 'fence',  path: 'assets/game-img/background/darken/fence.png' },
        ];
        assets.forEach(a => this.scene.load.image(a.key, a.path));
    }

    create(): void {
        const { width, height } = this.scene.scale;
        const configs: LayerConfig[] = [
            { key: 'forest', speed: 0.02, yFactor: 0.58, scale: 1, offsetTileY: 1, xRepeatFactor: 2 },
            { key: 'cloud1', speed: 0.04, yFactor: 0.25, scale: 0.5, spacing: 500, offsetX: 0, tileOffsetX: 0, xRepeatFactor: 2 },
            { key: 'cloud2', speed: 0.02, yFactor: 0.25, scale: 0.2, spacing: 1500, offsetX: 0, tileOffsetX: 0, xRepeatFactor: 5 },
            { key: 'cloud3', speed: 0.03, yFactor: 0.30, scale: 0.4, spacing: 950, offsetX: 0, tileOffsetX: 0, xRepeatFactor: 3 },
            { key: 'trees3', speed: 0.17, yFactor: 0.60, scale: 0.30, offsetTileY: 1, xRepeatFactor: 6 },
            { key: 'trees2', speed: 0.20, yFactor: 0.67, scale: 0.45, offsetTileY: 1, xRepeatFactor: 3 },
            { key: 'trees1', speed: 0.23, yFactor: 0.81, scale: 0.7, offsetTileY: 1, xRepeatFactor: 2 },
            { key: 'fence',  speed: 1.00, yFactor: 1.00, scale: 0.65, xRepeatFactor: 2 },
        ];

        configs.forEach((cfg, i) => {
            const srcImg = this.scene.textures.get(cfg.key).getSourceImage() as HTMLImageElement;
            const imgW = srcImg.width;
            const imgH = srcImg.height;

            let textureKey = cfg.key;
            if (cfg.spacing && cfg.spacing > 0) {
                const spacedKey = `${cfg.key}_spaced`;
                if (!this.scene.textures.exists(spacedKey)) {
                    const canvas = document.createElement('canvas');
                    canvas.width = imgW + cfg.spacing;
                    canvas.height = imgH;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(srcImg, 0, 0);
                    this.scene.textures.addCanvas(spacedKey, canvas);
                }
                textureKey = spacedKey;
            }

            const x0 = cfg.offsetX ?? 0;
            const repeat = cfg.xRepeatFactor ?? 2;
            const tileWidth = width * repeat;

            const tile = this.scene.add
                .tileSprite(x0, height * cfg.yFactor, tileWidth, imgH, textureKey)
                .setOrigin(0, 1)
                .setScrollFactor(0)
                .setDepth(-configs.length + i)
                .setScale(cfg.scale);

            if (cfg.tileOffsetX) tile.tilePositionX = cfg.tileOffsetX;
            if (cfg.offsetTileY) tile.tilePositionY = cfg.offsetTileY;

            this.layers.push({
                sprite: tile,
                key: cfg.key,
                speed: cfg.speed,
                original: cfg.speed,
                scale: cfg.scale
            });
        });

        this.sub = this.raceSvc.horsesList$.subscribe((list: OngoingHorsesList) => {
            const leader = list.getByPlacement()[0];
            const pos    = leader.position!;
            const dist   = this.raceSvc.winningDistance;

            // 1) Freeze in pre or when fully done
            const done         = pos >= dist;
            const shouldFreeze = this.raceState === 'pre' || done;

            // 2) Compute normalized, shifted progress [0,1]
            const mapStartOffset   = 2/12;
            const rawProgress      = Phaser.Math.Clamp(pos / dist, 0, 1);
            const shiftedProgress  = Phaser.Math.Wrap(rawProgress + mapStartOffset, 0, 1);

            // 3) Figure out which quarter we’re in
            const q         = shiftedProgress * 4;
            const inSecond  = q >= 1   && q <  2;
            const inFourth  = q >= 3   && q <= 4;
            const invertForest = inSecond || inFourth;

            // 4) Apply to your layers
            this.layers.forEach(l => {
                if (['forest','trees3','trees2','trees1','fence'].includes(l.key)) {
                    if (shouldFreeze) {
                        l.speed = 0;
                    } else if ((l.key==='forest'||l.key==='trees3') && invertForest) {
                        l.speed = -l.original;
                    } else {
                        l.speed = l.original;
                    }
                }
            });
        });

        this.raceStateSub = this.raceSvc.raceState$.subscribe(state => {
            this.raceState = state;
        });
    }

    update(_time: number, delta: number): void {
        this.layers.forEach(l => {
            l.sprite.tilePositionX += l.speed * delta;
        });
    }

    destroy(): void {
        this.sub?.unsubscribe();
        this.raceStateSub?.unsubscribe();
    }
}
