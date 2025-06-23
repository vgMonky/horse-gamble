// bet-pick-ui.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DropDownComponent } from '../base-components/drop-down/drop-down.component';
import type { HorseSlot } from '@app/game/horse-race.abstract';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bet-pick-ui',
    standalone: true,
    imports: [DropDownComponent, CommonModule],
    templateUrl: './bet-pick-ui.component.html',
    styleUrls: ['./bet-pick-ui.component.scss']
})
export class BetPickUiComponent {
    @Input() selected!: HorseSlot;
    @Output() selectedChange = new EventEmitter<HorseSlot>();

    readonly options: { slot: HorseSlot; label: string }[] = [
        { slot: 0, label: 'Horse slot 0' },
        { slot: 1, label: 'Horse slot 1' },
        { slot: 2, label: 'Horse slot 2' },
        { slot: 3, label: 'Horse slot 3' },
    ];

    onSelect(slot: HorseSlot) {
        this.selectedChange.emit(slot);
    }

    /** Angular template can bind to this safely */
    get selectedLabel(): string {
        const opt = this.options.find(o => o.slot === this.selected);
        return opt ? opt.label : 'win';
    }
}
