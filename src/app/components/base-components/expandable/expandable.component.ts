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
    @Input() isOpen: boolean = false;  // Independent toggle state
    @Output() toggleState = new EventEmitter<void>();

    toggle(): void {
        this.isOpen = !this.isOpen; // Self-toggle when outside group
        this.toggleState.emit();    // Notify group if part of one
    }
}
