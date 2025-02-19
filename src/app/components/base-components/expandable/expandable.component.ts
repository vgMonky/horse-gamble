import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-expandable',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './expandable.component.html',
    styleUrl: './expandable.component.scss'
})
export class ExpandableComponent {
    @Input() isOpen: boolean = false;
    @Output() toggleState = new EventEmitter<boolean>();

    toggle(): void {
        this.isOpen = !this.isOpen;
        this.toggleState.emit(this.isOpen);
    }
}
