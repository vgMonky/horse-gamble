import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ExpandableManagerService } from './expandable-manager.service';

@Component({
    selector: 'app-expandable',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './expandable.component.html',
    styleUrl: './expandable.component.scss'
})
export class ExpandableComponent implements OnInit, OnDestroy {
    @Input() expandableId!: string;
    @Input() groupId?: string;
    isOpen = false;
    private subscription!: Subscription;

    constructor(private expandableManager: ExpandableManagerService) {}

    ngOnInit() {
        this.subscription = this.expandableManager.state$.subscribe(state => {
            this.isOpen = !!state[this.expandableId];
        });
    }

    toggle() {
        this.expandableManager.toggle(this.expandableId, this.groupId);
    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
