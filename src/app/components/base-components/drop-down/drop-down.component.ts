import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-drop-down',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './drop-down.component.html',
    styleUrls: ['./drop-down.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DropDownComponent {
    isOpen = false;

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    closeDropdown() {
        this.isOpen = false;
    }
}
