import { Component, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-ongoing-horse-ui',
    templateUrl: './ongoing-horse-ui.component.html',
    styleUrls: ['./ongoing-horse-ui.component.scss']
})
export class OngoingHorseUiComponent {
    @Input() horse!: {
        index: number;
        name: string;
        position: number | null;
        placement?: number;
    };
    @Input() finalPosition = 1000;

    // helper to get ordinal suffix
    getOrdinal(n: number) {
        const s = ['th','st','nd','rd'];
        const v = n % 100;
        return n + (s[(v-20)%10]||s[v]||s[0]);
    }
}
