// src/app/components/ongoing-horse-ui/ongoing-horse-ui.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaceHorse } from '@app/game/horse-race.service';

@Component({
    standalone: true,
    selector: 'app-ongoing-horse-ui',
    imports: [CommonModule],
    templateUrl: './ongoing-horse-ui.component.html',
    styleUrls: ['./ongoing-horse-ui.component.scss']
})
export class RaceHorseUiComponent {
    @Input() RaceHorse!: RaceHorse;
    @Input() color!: string;

    getOrdinal(n: number) {
        const s = ['th','st','nd','rd'];
        const v = n % 100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
    }
}
