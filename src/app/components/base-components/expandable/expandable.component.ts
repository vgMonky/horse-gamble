import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    imports: [CommonModule],
    selector: 'app-expandable',
    standalone: true,
    templateUrl: './expandable.component.html',
    styleUrl: './expandable.component.scss'
})
export class ExpandableComponent {
    @Input() id!: number;
    @Input() isOpen: boolean = false;
    @Output() toggleState = new EventEmitter<{ id: number; isOpen: boolean }>();

    toggle(): void {
        this.isOpen = !this.isOpen;
        this.toggleState.emit({ id: this.id, isOpen: this.isOpen });
    }
}