// src/app/components/phaser-canvas/game_visuals/parallax_background.ts
import Phaser from 'phaser';
import type { Subscription } from 'rxjs';
import type {
    OngoingRaceService,
    OngoingHorsesList,
    OngoingHorse
} from '@app/game/ongoing-race.service';

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
    private layers: Layer[]     = [];
    private sub?:    Subscription;

    constructor(
        private scene:   Phaser.Scene,
        private raceSvc: OngoingRaceService
    ) {}

    preload(): void {
        const assets = [
            { key: 'cloud1', path: 'assets/game-img/background/cloud_1.png' },
            { key: 'cloud2', path: 'assets/game-img/background/cloud_2.png' },
            { key: 'cloud3', path: 'assets/game-img/background/cloud_3.png' },
            { key: 'forest', path: 'assets/game-img/background/forest_bg.png' },
            { key: 'trees3',  path: 'assets/game-img/background/darken/grass_trees.png' },
            { key: 'trees2',  path: 'assets/game-img/background/darken/grass_trees.png' },
            { key: 'trees1',  path: 'assets/game-img/background/darken/grass_trees.png' },
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
            { key: 'trees3',  speed: 0.17, yFactor: 0.60, scale: 0.30, offsetTileY: 1, xRepeatFactor: 6 },
            { key: 'trees2',  speed: 0.20, yFactor: 0.67, scale: 0.45, offsetTileY: 1, xRepeatFactor: 3 },
            { key: 'trees1',  speed: 0.23, yFactor: 0.81, scale: 0.7, offsetTileY: 1, xRepeatFactor: 2 },
            { key: 'fence',  speed: 0.92, yFactor: 1.00, scale: 0.65, xRepeatFactor: 2 },
        ];

        configs.forEach((cfg, i) => {
            // grab raw image dimensions
            const srcImg = this.scene.textures.get(cfg.key).getSourceImage() as HTMLImageElement;
            const imgW = srcImg.width;
            const imgH = srcImg.height;

            // build spaced texture if required
            let textureKey = cfg.key;
            if (cfg.spacing && cfg.spacing > 0) {
                const spacedKey = `${cfg.key}_spaced`;
                if (!this.scene.textures.exists(spacedKey)) {
                    const canvas = document.createElement('canvas');
                    canvas.width  = imgW + cfg.spacing;
                    canvas.height = imgH;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(srcImg, 0, 0);
                    this.scene.textures.addCanvas(spacedKey, canvas);
                }
                textureKey = spacedKey;
            }

            // initial placement & sizing
            const x0         = cfg.offsetX ?? 0;
            const repeat     = cfg.xRepeatFactor ?? 2;
            const tileWidth  = width * repeat;

            const tile = this.scene.add
                .tileSprite(x0, height * cfg.yFactor, tileWidth, imgH, textureKey)
                .setOrigin(0, 1)
                .setScrollFactor(0)
                .setDepth(-configs.length + i)
                .setScale(cfg.scale);

            if (cfg.tileOffsetX)   tile.tilePositionX = cfg.tileOffsetX;
            if (cfg.offsetTileY)   tile.tilePositionY = cfg.offsetTileY;

            this.layers.push({
                sprite:   tile,
                key:      cfg.key,
                speed:    cfg.speed,
                original: cfg.speed,
                scale:    cfg.scale
            });
        });

        // subscribe to freeze fence/trees/forest when leader crosses finish
        this.sub = this.raceSvc.horsesList$.subscribe((list: OngoingHorsesList) => {
            const leader = list.getByPlacement()[0];
            const done   = leader.position! >= this.raceSvc.winningDistance;

            this.layers.forEach(l => {
                if (['forest', 'trees3', 'trees2', 'trees1','fence'].includes(l.key)) {
                    l.speed = done ? 0 : l.original;
                }
            });
        });
    }

    update(_time: number, delta: number): void {
        this.layers.forEach(l => {
            l.sprite.tilePositionX += l.speed * delta;
        });
    }

    destroy(): void {
        this.sub?.unsubscribe();
    }
}
