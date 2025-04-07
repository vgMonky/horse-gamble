import { Component, OnDestroy } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { PhaserCanvasComponent } from '@app/components/phaser-canvas/phaser-canvas.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-trade',
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        PhaserCanvasComponent
    ],
    templateUrl: './race.component.html',
    styleUrls: ['./race.component.scss']
})
export class RaceComponent implements OnDestroy {
    useHorse1 = true;
    horses: Horse[] = [];
    seed!: Seed;
    private intervalId: any;
    private raceFinished = false;

    constructor() {
        this.initializeRace();
    }

    initializeRace(): void {
        this.horses = Array.from({ length: 4 }, (_, i) => new Horse(i + 1));
        this.raceFinished = false;

        this.intervalId = setInterval(() => this.runRaceTick(), 1000);
    }

    runRaceTick(): void {
        if (this.raceFinished) return;

        this.seed = new Seed(8);
        const advances = this.seed.splitNumber(this.horses.length);

        this.horses.forEach((horse, i) => {
            const amount = advances[i] || 0;
            horse.advance(amount);
        });

        console.log('Seed value:', this.seed.value);
        console.log('Advance values:', advances);
        console.log('Horse positions:', this.horses.map(h => h.position));

        const winner = this.horses.find(h => h.position >= 500);
        if (winner) {
            this.raceFinished = true;
            clearInterval(this.intervalId);

            console.log(`🏁 Horse ${winner.index} wins the race!`);

            // Sort horses by position descending
            const podium = [...this.horses].sort((a, b) => b.position - a.position);
            console.log('🏆 Final standings:');
            podium.forEach((horse, place) => {
                console.log(`${place + 1}º place: Horse ${horse.index} (${horse.position})`);
            });
        }
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }
}

// Horse model
class Horse {
    constructor(public index: number, public position: number = 0) {}

    advance(amount: number) {
        this.position += amount;
    }
}

// Seed model
class Seed {
    private seedValue: number;

    constructor(length: number) {
        this.seedValue = this.genNumber(length);
    }

    private genNumber(length: number): number {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    splitNumber(parts: number): number[] {
        const digits = this.seedValue.toString().split('');
        const chunkSize = Math.floor(digits.length / parts);

        if (chunkSize === 0) return [];

        const result: number[] = [];

        for (let i = 0; i < parts; i++) {
            const chunk = digits.slice(i * chunkSize, (i + 1) * chunkSize);
            if (chunk.length === chunkSize) {
                result.push(parseInt(chunk.join(''), 10));
            }
        }

        return result;
    }

    get value(): number {
        return this.seedValue;
    }
}
