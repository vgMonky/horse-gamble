// src/app/components/ongoing-horse-ui/ongoing-horse-ui.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-ongoing-horse-ui',
    imports: [CommonModule],
    templateUrl: './ongoing-horse-ui.component.html',
    styleUrls: ['./ongoing-horse-ui.component.scss']
})
export class OngoingHorseUiComponent {
    @Input() horse!: { index: number; position: number };
    @Input() finalPosition = 1000;
}
