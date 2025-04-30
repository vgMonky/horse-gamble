// src/app/components/phaser-canvas/game_visuals/parallax_background.ts
import Phaser from 'phaser';

interface Layer {
    sprite: Phaser.GameObjects.TileSprite;
    speed: number;
    scale: number;
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
            { key: 'trees',  path: 'assets/game-img/background/grass_trees.png' },
            { key: 'fence',  path: 'assets/game-img/background/fence.png' },
        ];
        assets.forEach(a => this.scene.load.image(a.key, a.path));
    }

    create(): void {
        const { width, height } = this.scene.scale;

        // each config now has a 'scale' field
        const configs = [
            { key: 'forest', speed: 0.02, yFactor: 0.70, scale: 1.4 },
            { key: 'cloud1', speed: 0.04, yFactor: 0.20, scale: 0.5 },
            { key: 'cloud2', speed: 0.06, yFactor: -0.25, scale: 0.2 },
            { key: 'cloud3', speed: 0.10, yFactor: 0.30, scale: 0.4 },
            { key: 'trees',  speed: 0.10, yFactor: 0.78, scale: 0.5 },
            { key: 'fence',  speed: 0.62, yFactor: 1.00, scale: 0.65 },
        ];

        configs.forEach((cfg, i) => {
            const src = this.scene.textures.get(cfg.key).getSourceImage() as HTMLImageElement;
            const hImg = src.height;

            const tile = this.scene.add
                .tileSprite(0, height * cfg.yFactor, width * 2, hImg, cfg.key)
                .setOrigin(0, 1)
                .setScrollFactor(0)
                .setDepth(-configs.length + i)
                .setScale(cfg.scale);

            this.layers.push({ sprite: tile, speed: cfg.speed, scale: cfg.scale });
        });
    }

    update(_time: number, delta: number): void {
        this.layers.forEach(l => {
            l.sprite.tilePositionX += l.speed * delta;
        });
    }
}
