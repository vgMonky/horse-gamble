import { Component, ContentChildren, QueryList, AfterContentInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ExpandableComponent } from '../expandable/expandable.component';
import { Subscription } from 'rxjs';

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
export class ExpandableGroupComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    @ContentChildren(ExpandableComponent) expandables!: QueryList<ExpandableComponent>;
    private queryListSub!: Subscription;

    constructor(private cdr: ChangeDetectorRef) {}

    ngAfterContentInit(): void {
        this.setupExpandables();

        // Subscribe to QueryList changes (dynamic updates)
        this.queryListSub = this.expandables.changes.subscribe(() => {
            this.setupExpandables();
        });
    }

    ngAfterViewInit(): void {
        this.setupExpandables();
        this.cdr.detectChanges();
    }

    private setupExpandables(): void {
        if (!this.expandables?.length) {
            return;
        }

        this.assignIds();
        this.expandables.forEach((expandable) => {
            expandable.toggleState.subscribe((event) => this.toggleExpandable(event.id, event.isOpen));
        });

        this.cdr.detectChanges();
    }

    private assignIds(): void {
        // Delay ID assignment to avoid ExpressionChangedAfterItHasBeenCheckedError.
        // The code inside setTimeout is not executed immediately. Instead, it gets queued and runs after the current Angular change detection cycle completes.
        setTimeout(() => {
            this.expandables.forEach((expandable, index) => {
                if (expandable.id === undefined) {
                    expandable.id = index;
                }
            });
            this.cdr.detectChanges(); // Ensure Angular detects changes properly
        });
    }

    private toggleExpandable(clickedId: number, isOpen: boolean): void {
        this.expandables.forEach((expandable) => {
            expandable.isOpen = expandable.id === clickedId ? isOpen : false;
        });
    }

    ngOnDestroy(): void {
        if (this.queryListSub) {
            this.queryListSub.unsubscribe();
        }
    }
}
