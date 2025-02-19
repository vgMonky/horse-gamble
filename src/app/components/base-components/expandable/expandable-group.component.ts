import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { ExpandableComponent } from '../expandable/expandable.component';

@Component({
    selector: 'app-expandable-group',
    standalone: true,
    template: `<ng-content></ng-content>`,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
    `]
})
export class ExpandableGroupComponent implements AfterContentInit {
    @ContentChildren(ExpandableComponent) expandables!: QueryList<ExpandableComponent>;
    private activeIndex: number | null = null;

    ngAfterContentInit(): void {
        this.expandables.forEach((expandable, index) => {
            expandable.toggleState.subscribe(() => this.toggleExpandable(index));
        });
    }

    private toggleExpandable(index: number): void {
        if (this.activeIndex === index) {
            // Close if the same one is clicked again
            this.expandables.get(index)!.isOpen = false;
            this.activeIndex = null;
        } else {
            // Open the clicked one and close others
            this.expandables.forEach((expandable, i) => {
                expandable.isOpen = i === index;
            });
            this.activeIndex = index;
        }
    }
}
