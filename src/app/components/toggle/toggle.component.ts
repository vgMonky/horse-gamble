import { Component, ContentChildren, QueryList, AfterContentInit, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-toggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class ToggleComponent implements AfterContentInit {
    @ContentChildren('stateContent') projectedContents!: QueryList<any>;
    @Output() stateChange = new EventEmitter<number>();
    currentState = 0;

    ngAfterContentInit() {
        if (this.projectedContents.length === 0) {
            console.warn('ToggleComponent: No projected content found.');
        }
    }

    setState(index: number) {
        this.currentState = index;
        this.stateChange.emit(this.currentState);
    }
}
