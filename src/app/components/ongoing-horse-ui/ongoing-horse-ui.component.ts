// src/app/components/ongoing-horse-ui/ongoing-horse-ui.component.ts
import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Horse } from '@app/game/ongoing-race.service';

@Component({
    standalone: true,
    selector: 'app-ongoing-horse-ui',
    imports: [CommonModule],
    templateUrl: './ongoing-horse-ui.component.html',
    styleUrls: ['./ongoing-horse-ui.component.scss']
})
export class OngoingHorseUiComponent {
    @Input() horse!: Horse;
    @Input() placement!: number;
    @Input() finalPosition!: number;

    getOrdinal(n: number) {
        const s = ['th','st','nd','rd'];
        const v = n % 100;
        return n + (s[(v-20)%10]||s[v]||s[0]);
    }
}
