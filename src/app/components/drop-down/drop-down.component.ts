import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-drop-down',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './drop-down.component.html',
    styleUrls: ['./drop-down.component.scss']
})
export class DropDownComponent {
    @Input() buttonText: string = 'buttonText';  // Default text

    isOpen = false;

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    closeDropdown() {
        this.isOpen = false;
    }
}
