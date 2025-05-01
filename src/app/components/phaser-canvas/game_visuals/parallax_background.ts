// src/app/components/phaser-canvas/game_visuals/parallax_background.ts
import Phaser from 'phaser';

interface Layer {
    sprite: Phaser.GameObjects.TileSprite;
    speed: number;
    scale: number;
}

interface LayerConfig {
    key: string;
    speed: number;
    yFactor: number;
    scale: number;
    spacing?: number;        // your existing gap
    offsetX?: number;        // initial X position
    tileOffsetX?: number;    // initial horizontal texture offset
    offsetTileY?: number;    // initial vertical texture offset
    xRepeatFactor?: number;  // how many screen-widths the tile sprite covers (default 2)
}

export class ParallaxBackground {
    private layers: Layer[] = [];

    constructor(private scene: Phaser.Scene) {}

    preload(): void {
        const assets = [
            { key: 'cloud1', path: 'assets/game-img/background/cloud_1.png' },
            { key: 'cloud2', path: 'assets/game-img/background/cloud_2.png' },
            { key: 'cloud3', path: 'assets/game-img/background/cloud_3.png' },
            { key: 'forest', path: 'assets/game-img/background/forest_bg.png' },
            { key: 'trees',  path: 'assets/game-img/background/darken/grass_trees.png' },
            { key: 'fence',  path: 'assets/game-img/background/darken/fence.png' },
        ];
        assets.forEach(a => this.scene.load.image(a.key, a.path));
    }

    create(): void {
        const { width, height } = this.scene.scale;

        const configs: LayerConfig[] = [
            { key: 'forest', speed: 0.02, yFactor: 0.70, scale: 1.4, offsetTileY: 1, xRepeatFactor: 2 },
            { key: 'cloud1', speed: 0.04, yFactor: 0.25, scale: 0.5, spacing: 500, offsetX: 0, tileOffsetX: 0, xRepeatFactor: 2 },
            { key: 'cloud2', speed: 0.02, yFactor: 0.25, scale: 0.2, spacing: 1500, offsetX: 0, tileOffsetX: 0, xRepeatFactor: 5 },
            { key: 'cloud3', speed: 0.03, yFactor: 0.30, scale: 0.4, spacing: 950, offsetX: 0, tileOffsetX: 0, xRepeatFactor: 3 },
            { key: 'trees',  speed: 0.13, yFactor: 0.78, scale: 0.5, offsetTileY: 1, xRepeatFactor: 2 },
            { key: 'fence',  speed: 0.68, yFactor: 1.00, scale: 0.65, xRepeatFactor: 2 },
        ];

        configs.forEach((cfg, i) => {
            // grab the raw image
            const srcImg = this.scene.textures.get(cfg.key).getSourceImage() as HTMLImageElement;
            const imgW = srcImg.width;
            const imgH = srcImg.height;

            // build a spaced texture if needed
            let textureKey = cfg.key;
            if (cfg.spacing && cfg.spacing > 0) {
                const paddedKey = `${cfg.key}_spaced`;
                if (!this.scene.textures.exists(paddedKey)) {
                    const canvas = document.createElement('canvas');
                    canvas.width = imgW + cfg.spacing;
                    canvas.height = imgH;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(srcImg, 0, 0);
                    this.scene.textures.addCanvas(paddedKey, canvas);
                }
                textureKey = paddedKey;
            }

            // initial positions & sizes
            const x0 = cfg.offsetX ?? 0;
            const repeat = cfg.xRepeatFactor ?? 2;
            const tileWidth = width * repeat;

            const tile = this.scene.add
                .tileSprite(
                    x0,
                    height * cfg.yFactor,
                    tileWidth,
                    imgH,
                    textureKey
                )
                .setOrigin(0, 1)
                .setScrollFactor(0)
                .setDepth(-configs.length + i)
                .setScale(cfg.scale);

            // apply initial texture offsets if provided
            if (cfg.tileOffsetX) {
                tile.tilePositionX = cfg.tileOffsetX;
            }
            if (cfg.offsetTileY) {
                tile.tilePositionY = cfg.offsetTileY;
            }

            this.layers.push({ sprite: tile, speed: cfg.speed, scale: cfg.scale });
        });
    }

    update(_time: number, delta: number): void {
        this.layers.forEach(l => {
            l.sprite.tilePositionX += l.speed * delta;
        });
    }
}
